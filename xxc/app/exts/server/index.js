import Platform from 'Platform';
import extractZip from 'extract-zip';
import Path from 'path';
import {socket} from '../../core/server';
import {createExtension} from '../extension';

let onChangeListener = null;
let currentUser = null;
let exts = null;
let isProcessing = false;

const checkLocalCache = ext => {
    return new Promise(resolve => {
        // 检查是否存在本地扩展包目录
        Platform.fs.pathExists(ext.localPath).then(isLocalPathExists => {
            if (isLocalPathExists) {
                // 如果本地扩展包目录已经存在则检查 md5 值是否一致
                const md5Obj = Platform.fs.readJsonSync(Path.join(ext.localPath, 'md5.json'), {throws: false});
                if (md5Obj && md5Obj.md5 === ext.md5) {
                    return resolve(true);
                } else {
                    Platform.fs.emptyDirSync(ext.localPath);
                }
            }
            return resolve(false);
        }).catch(() => (resolve(false)));
    });
};

const downloadRemoteExtension = ext => {
    return Platform.net.downloadFile(currentUser, {
        url: ext.download,
        path: ext.remoteCachePath,
    }, progress => {
        ext.downloadProgress = progress / 100;
        if (onChangeListener) {
            onChangeListener(ext, 'update');
        }
    }).then(file => {
        if (file.localPath) {
            return new Promise((resolve, reject) => {
                extractZip(file.localPath, {dir: ext.localPath}, err => {
                    Platform.fs.removeSync(file.localPath);
                    if (err) {
                        err.code = 'EXT_UNZIP_ERROR';
                        reject(err);
                    } else {
                        Platform.fs.outputJsonSync(Path.join(ext.localPath, 'md5.json'), {md5: ext.md5, download: ext.download, downloadTime: new Date().getTime()});
                        resolve(ext);
                    }
                });
            });
        }
        return Promise.reject('Cannot download extension package form remote server ' + ext.download);
    });
};

const loadRemoteExtension = ext => {
    return Platform.fs.readJson(Path.join(ext.localPath, 'package.json'), {throws: false});
};

const processExtensions = async () => {
    if (!exts || !exts.length || isProcessing) {
        return;
    }
    const theExt = exts.find(x => !x.isRemoteLoaded && !x.loadRemoteFailed);
    if (theExt) {
        isProcessing = true;

        try {
            const isLocalCacheOk = await checkLocalCache(theExt);
            if (!isLocalCacheOk) {
                await downloadRemoteExtension(theExt);
            }
            // load package json
            const pkgJson = await loadRemoteExtension(theExt);
            if (pkgJson) {
                if (pkgJson.name === theExt.name) {
                    if (onChangeListener) {
                        onChangeListener(theExt, 'remove');
                    }
                    const findIndex = exts.findIndex(x => x.name === theExt.name);
                    theExt.setLoadRemoteResult(pkgJson);
                    theExt.delete = true;
                    const newExt = createExtension(Object.assign({
                        icon: theExt.icon,
                    }, pkgJson, {
                        download: theExt.download,
                        md5: theExt.md5
                    }), theExt.data);
                    newExt.hotAttach();
                    exts.splice(findIndex, 1, newExt);
                    if (onChangeListener) {
                        onChangeListener(newExt, 'add');
                    }
                } else {
                    theExt.setLoadRemoteResult(false, new Error(`The package name(${pkgJson.name}) is not match the server name(${theExt.name})`));
                }
            } else {
                theExt.setLoadRemoteResult(false, new Error('Cannot read package.json from ' + theExt.localPath));
            }
        } catch (error) {
            theExt.setLoadRemoteResult(false, error);
        }

        if (!theExt.delete && onChangeListener) {
            onChangeListener(theExt, 'update');
        }

        isProcessing = false;
        processExtensions();
    }
};

const handleChatExtensions = (msg, socket) => {
    if (currentUser && msg.isSuccess && msg.data.length) {
        const baseUserExtsDir = Platform.ui.createUserDataPath(currentUser, '', 'extensions');
        msg.data.forEach(item => {
            const ext = createExtension(Object.assign(item, {
                icon: item.logo,
            }), {
                remoteCachePath: Path.join(baseUserExtsDir, `${item.name}.zip`),
                localPath: Path.join(baseUserExtsDir, item.name)
            });
            console.log('>> handleChatExtensions', Object.assign({}, ext), item);
            const findIndex = exts.findIndex(x => x.name === ext.name);
            if (findIndex > -1) {
                exts.splice(findIndex, 1, ext);
            } else {
                exts.splice(0, 0, ext);
            }
        });
        if (onChangeListener) {
            onChangeListener(exts, 'add');
        }
        processExtensions();
    }
};

socket.setHandler({
    'chat/extensions': handleChatExtensions,
});

export const detachServerExtensions = user => {
    currentUser = null;
    if (exts) {
        exts.forEach(ext => {
            ext.detach();
        });
        if (onChangeListener) {
            onChangeListener(exts, 'remove');
        }
        exts = null;
    }
};

export const fetchServerExtensions = (user) => {
    detachServerExtensions();

    if (user.isVersionSupport('remoteExtension')) {
        currentUser = user;
        exts = [];
        return socket.send('extensions');
    }
};

export const setServerOnChangeListener = listener => {
    onChangeListener = listener;
};

export default {
    fetchServerExtensions,
    setServerOnChangeListener,
    detachServerExtensions
};
