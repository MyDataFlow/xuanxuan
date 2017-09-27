import Platform from '../platform/electron';
import md5 from 'md5';

const isUserLogining = false;

/**
 *
 * @param {Object} user
 */
const requestServerInfo = user => {
    let form = new FormData();
    form.append('data', JSON.stringify({
        'module': 'chat',
        'method': 'login',
        params: [
            user.serverName,
            user.account,
            user.passwordMD5,
            ''
        ]
    }));
    return Platform.net.postJSON(user.webServerInfoUrl, form).then(data => {
        if(data) {
            user.socketPort     = data.chatPort;
            user.token          = data.token;
            user.serverVersion  = data.version;
            user.socketUrl      = data.socketUrl;
            user.uploadFileSize = data.uploadFileSize;
            return Promise.resolve(user);
        } else {
            return Promise.reject({message: 'Empty serverInfo data', code: 'WRONG_DATA'});
        }
    });
};

/**
 *
 * @param {User} user
 * @param {number} size
 */
const checkUploadFileSize = (user, size) => {
    if(typeof size === 'object') {
        size = size.size;
    }
    const uploadFileSize = user.uploadFileSize;
    return uploadFileSize && size <= uploadFileSize;
};

const uploadFile = (user, file, data = {}, onProgress = null) => {
    return Platform.net.uploadFile(user, file, data, onProgress);
};

const createFileDownloadUrl = (user, file) => {
    return user.makeServerUrl(`download?fileName=${encodeURIComponent(file.name)}&time=${file.time}&id=${file.id}&ServerName=${user.serverName}&gid=${user.id}&sid=${md5(user.sessionID + file.name)}`);
};

const downloadFile = (user, file, onProgress = null) => {
    if(!file.url) {
        const url = createFileDownloadUrl(user, file);
        file.url = url;
    }
    return Platform.net.downloadFile(user, file, onProgress);
};

export default {
    downloadFile,
    uploadFile,
    requestServerInfo,
    checkUploadFileSize,
    createFileDownloadUrl,
};


