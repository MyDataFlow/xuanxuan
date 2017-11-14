import fse, { exists } from 'fs-extra';
import Request from 'request';
import Path from 'path';
import uuid from 'uuid/v4';
import network from '../common/network';
import {userDataPath} from './ui';

const downloadFileOrigin = network.downloadFile;
const uploadFileOrigin = network.uploadFile;

const createImageFilePath = (user, file) => {
    return Path.join(userDataPath, 'users', user.identify, 'images', file.name);
};

const localFilePaths = {};
const saveLocalFile = (file, user, path) => {
    if (file.id) {
        const localId = `${user.identify}:${file.id}`;
        localFilePaths[localId] = path || file.src || file.path;
    }
};
const isFileExists = (file, user) => {
    if (file.id) {
        const localId = `${user.identify}:${file.id}`;
        if (localFilePaths[localId]) {
            return Promise.resolve(localFilePaths[localId]);
        }
    }
    const fileSavePath = file.path || createImageFilePath(user, file);
    return fse.pathExists(fileSavePath).then(exists => {
        if (exists) {
            if (file.id) {
                saveLocalFile(file, user, fileSavePath);
            }
            return Promise.resolve(fileSavePath);
        }
        return Promise.resolve(false);
    });
};

const downloadFileWithRequest = (user, url, fileSavePath, onProgress) => {
    return downloadFileOrigin(url, null, onProgress).then(fileBuffer => {
        const buffer = new Buffer(new Uint8Array(fileBuffer));
        return fse.outputFile(fileSavePath, buffer);
    });
};

const downloadFile = (user, file, onProgress) => {
    return isFileExists(file, user).then(fileSavePath => {
        if (fileSavePath) {
            file.src = fileSavePath;
            if (DEBUG) {
                console.collapse('HTTP DOWNLOAD', 'blueBg', file.url, 'bluePale', 'Cached', 'bluePale');
                console.log('file', file);
                console.groupEnd();
            }
            if (file.path && file.path !== fileSavePath) {
                return fse.copy(fileSavePath, file.path).then(() => {
                    return Promise.resolve(file);
                });
            } else if (!file.path) {
                return Promise.resolve(file);
            }
        }
        fileSavePath = file.path || createImageFilePath(user, file);
        fse.ensureDirSync(Path.dirname(fileSavePath));
        return downloadFileWithRequest(user, file.url, fileSavePath, onProgress).then(() => {
            if (DEBUG) {
                console.collapse('HTTP DOWNLOAD', 'blueBg', file.url, 'bluePale', 'OK', 'greenPale');
                console.log('file', file);
                console.groupEnd();
            }
            file.src = fileSavePath;
            saveLocalFile(file, user, fileSavePath);
            return Promise.resolve(file);
        });
    });
};

const uploadFile = (user, file, data = {}, onProgress = null) => {
    const serverUrl = user.uploadUrl;
    const form = new FormData();
    form.append('file', file.blob || file, file.name);
    form.append('userID', user.id);
    if (data.gid) {
        form.append('gid', data.gid);
    }
    file.form = form;
    const filename = data.copy ? `${uuid()}${Path.extname(file.name)}` : file.name;
    const copyPath = data.copy ? createImageFilePath(user, {name: filename}) : null;
    return uploadFileOrigin(file, serverUrl, xhr => {
        xhr.setRequestHeader('ServerName', user.serverName);
        xhr.setRequestHeader('Authorization', user.token);
    }, onProgress).then(remoteData => {
        remoteData.name = filename;
        const resolve = () => {
            if (DEBUG) {
                console.collapse('HTTP UPLOAD Request', 'blueBg', serverUrl, 'bluePale', 'OK', 'greenPale');
                console.log('files', file);
                console.log('remoteData', remoteData);
                console.groupEnd();
            }
            saveLocalFile(file, user, file.src);
            return Promise.resolve(remoteData);
        };
        if (data.copy) {
            file.src = copyPath;
            return fse.copy(file.path, copyPath).then(resolve);
        }
        file.src = file.path;
        return resolve();
    });
};

network.uploadFile = uploadFile;
network.downloadFile = downloadFile;
network.isFileExists = isFileExists;

export default network;
