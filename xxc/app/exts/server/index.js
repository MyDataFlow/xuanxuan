import Platform from 'Platform';
import extractZip from 'extract-zip';
import Path from 'path';
import server, {socket} from '../../core/server';
import {createExtension} from '../extension';

let onChangeListener = null;
let currentUser = null;
let exts = null;
let isProcessing = false;
let nextFetchTask = null;
const fetchTaskInterval = 1000 * 60 * 60 * 1.5;

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
        return Promise.reject(`Cannot download extension package form remote server ${ext.download}.`);
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
            if (pkgJson && pkgJson.name) {
                if (pkgJson.name === theExt.name) {
                    if (DEBUG) {
                        console.warn(`The package name(${pkgJson.name}) is not match the server name(${theExt.name})`);
                    }
                }
                if (onChangeListener) {
                    onChangeListener(theExt, 'remove');
                }
                const findIndex = exts.findIndex(x => x.name === theExt.name);
                theExt.setLoadRemoteResult(pkgJson);
                theExt.delete = true;
                const newExt = createExtension(Object.assign({
                    icon: theExt.icon,
                    serverEntry: theExt.serverEntry
                }, pkgJson, {
                    download: theExt.download,
                    md5: theExt.md5,
                    entryUrl: theExt.entryUrl,
                    entryID: theExt.entryID
                }), theExt.data);
                newExt.hotAttach();
                exts.splice(findIndex, 1, newExt);
                if (onChangeListener) {
                    onChangeListener(newExt, 'add');
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

export const getEntryVisitUrl = (ext, referer = '') => {
    return server.socket.sendAndListen({
        module: 'entry',
        method: 'visit',
        params: {entryID: ext.entryID || ext.name, referer}
    });
};

const handleChatExtensions = msg => {
    if (currentUser && msg.isSuccess && msg.data.length) {
        const baseUserExtsDir = Platform.ui.createUserDataPath(currentUser, '', 'extensions');
        msg.data.forEach(item => {
            item = Object.assign({}, item);
            const extPkg = Object.assign(Object.assign(item, {
                icon: item.logo,
                entryUrl: item.entryUrl || item.webViewUrl
            }));
            if (!item.download && item.webViewUrl) {
                extPkg.type = 'app';
                extPkg.appType = 'webView';
                extPkg.webViewUrl = item.webViewUrl;
            }
            const extData = {remote: true};
            if (item.download) {
                extData.remoteCachePath = Path.join(baseUserExtsDir, `${item.name}.zip`);
                extData.localPath = Path.join(baseUserExtsDir, item.name);
            } else if (item.webViewUrl) {
                extData.remoteLoaded = true;
            }
            const ext = createExtension(extPkg, extData);
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

const handleEntryVisit = msg => {
    if (currentUser && msg.isSuccess && msg.data) {
        return msg.data;
    }
    return false;
};

socket.setHandler({
    'chat/extensions': handleChatExtensions,
    'entry/visit': handleEntryVisit
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
    if (nextFetchTask) {
        clearTimeout(nextFetchTask);
        nextFetchTask = null;
    }

    if (!user && currentUser) {
        user = currentUser;
    }
    detachServerExtensions();

    if (!user) {
        return;
    }

    if (user.isVersionSupport('remoteExtension')) {
        currentUser = user;
        exts = [];
        socket.send('extensions');
    }

    nextFetchTask = setTimeout(() => {
        if (currentUser) {
            fetchServerExtensions(currentUser);
        }
    }, fetchTaskInterval);
};

export const setServerOnChangeListener = listener => {
    onChangeListener = listener;
};

export default {
    getEntryVisitUrl,
    fetchServerExtensions,
    setServerOnChangeListener,
    detachServerExtensions
};
