import {env, dialog} from 'Platform';
import Path from 'path';
import fse from 'fs-extra';
import uuid from 'uuid/v4';
import extractZip from 'extract-zip';
import db from './extensions-db';
import {createExtension} from './extension';

const createSavePath = extension => {
    return Path.join(env.dataPath, 'xexts', extension.name);
};

const uninstall = extension => {
    const savedPath = createSavePath(extension);
    return db.removeInstall(extension).then(() => {
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

const installFromDir = (dir, deleteDir = false) => {
    const pkgFilePath = Path.join(dir, 'package.json');
    let extension = null;
    return fse.readJSON(pkgFilePath).then(pkg => {
        extension = createExtension(pkg);
        return db.saveInstall(extension);
    }).then(extension => {
        const savedPath = createSavePath(extension);
        return fse.emptyDir(savedPath).then(() => {
            return fse.copy(dir, savedPath);
        });
    }).then(() => {
        if (deleteDir) {
            return fse.remove(dir);
        }
        return Promise.resolve();
    }).then(() => {
        return Promise.resolve(extension);
    });
};

const installFromXextFile = filePath => {
    return extractInstallFile(filePath).then(tmpPath => {
        return installFromDir(tmpPath, true);
    });
};

const openInstallDialog = (callback) => {
    dialog.showOpenDialog('.xext,.json,.zip', files => {
        if (files.length) {
            const filePath = files[0].path;
            const extName = Path.extname(filePath).toLowerCase();
            if (extName === '.json' && Path.basename(filePath) === 'package.json') {
                installFromDir(Path.dirname(filePath)).then(extension => {
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

export default {
    db,
    createSavePath,
    uninstall,
    installFromXextFile,
    openInstallDialog,
};

