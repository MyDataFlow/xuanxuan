import {env, dialog} from 'Platform';
import Path from 'path';
import fse from 'fs-extra';
import uuid from 'uuid/v4';
import extractZip from 'extract-zip';
import db from './extensions-db';
import {createExtension} from './extension';

const createSavePath = extension => {
    return extension.localPath || Path.join(env.dataPath, 'xexts', extension.name);
};

const uninstall = extension => {
    return db.removeInstall(extension).then(() => {
        if (extension.isDev) {
            return Promise.resolve();
        }
        const savedPath = createSavePath(extension);
        return fse.remove(savedPath);
    });
};

const extractInstallFile = filePath => {
    return new Promise((resolve, reject) => {
        const tmpPath = Path.join(env.tmpPath, uuid());
        extractZip(filePath, {dir: tmpPath}, err => {
            if (err) {
                err.code = 'EXT_UNZIP_ERROR';
                reject(err);
            } else {
                resolve(tmpPath);
            }
        });
    });
};

const reloadDevExtension = extension => {
    const path = extension.localPath;
    if (path) {
        const pkgFilePath = Path.join(path, 'package.json');
        const pkg = fse.readJSONSync(pkgFilePath, {throws: false});
        if (pkg) {
            extension = createExtension(pkg, extension.data);
            db.saveInstall(extension, true);
            if (DEBUG) {
                console.collapse('Extension Reload for Dev', 'greenBg', extension.name, 'greenPale');
                console.log('extension', extension);
                console.groupEnd();
            }
            return extension;
        }
    }
    return false;
};

const installFromDir = (dir, deleteDir = false, devMode = false) => {
    const pkgFilePath = Path.join(dir, 'package.json');
    const savedPath = devMode ? dir : createSavePath(extension);
    let extension = null;
    return fse.readJSON(pkgFilePath).then(pkg => {
        extension = createExtension(pkg, {
            localPath: savedPath,
            isDev: devMode
        });
        return db.saveInstall(extension);
    }).then(() => {
        if (!devMode) {
            return fse.emptyDir(savedPath).then(() => {
                return fse.copy(dir, savedPath);
            });
        }
        return Promise.resolve(extension);
    }).then(() => {
        if (deleteDir) {
            return fse.remove(dir).then(() => {
                return Promise.resolve(extension);
            });
        }
        return Promise.resolve(extension);
    });
};

const installFromDevDir = (dir) => {
    return installFromDir(dir, false, true);
};

const installFromXextFile = filePath => {
    return extractInstallFile(filePath).then(tmpPath => {
        return installFromDir(tmpPath, true);
    });
};

const openInstallDialog = (callback, devMode = false) => {
    dialog.showOpenDialog(devMode ? '.json' : '.xext,.json,.zip', files => {
        if (files.length) {
            const filePath = files[0].path;
            const extName = Path.extname(filePath).toLowerCase();
            if (extName === '.json' && Path.basename(filePath) === 'package.json') {
                installFromDir(Path.dirname(filePath), false, devMode).then(extension => {
                    if (callback) callback(extension);
                }).catch(error => {
                    if (callback) callback(false, error);
                });
            } else if (extName === '.xext' || extName === '.zip') {
                installFromXextFile(filePath).then(extension => {
                    if (callback) callback(extension);
                }).catch(error => {
                    if (callback) callback(false, error);
                });
            } else {
                if (callback) {
                    callback(false, 'EXT_NOT_EXT_SOURCE');
                }
            }
        } else {
            if (callback) {
                callback(false);
            }
        }
    });
};

const loadReadmeMarkdown = extension => {
    const filePath = Path.join(createSavePath(extension), 'README.md');
    return fse.readFile(filePath, 'utf8');
};

export default {
    db,
    createSavePath,
    uninstall,
    installFromXextFile,
    openInstallDialog,
    loadReadmeMarkdown,
    installFromDevDir,
    reloadDevExtension,
};

