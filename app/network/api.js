import Platform from 'Platform'; // eslint-disable-line
import md5 from 'md5';
import Config from 'Config';

/**
 * Request server infomation with https request
 * @param {Object} user
 */
const requestServerInfo = user => {
    const postData = JSON.stringify({
        module: 'chat',
        method: 'login',
        params: [
            user.serverName,
            user.account,
            user.passwordMD5,
            ''
        ],
        v: Config.pkg.version
    });
    return Platform.net.postJSON(user.webServerInfoUrl, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        body: `data=${postData}`
    }).then(data => {
        if (data) {
            user.socketPort = data.chatPort;
            user.token = data.token;
            user.serverVersion = data.version;
            user.socketUrl = data.socketUrl;
            user.uploadFileSize = data.uploadFileSize;
            user.ranzhiUrl = data.ranzhiUrl;
            return Promise.resolve(user);
        }
        return Promise.reject({message: 'Empty serverInfo data', code: 'WRONG_DATA'});
    });
};

/**
 * Check upload file size
 * @param {User} user
 * @param {number} size
 */
const checkUploadFileSize = (user, size) => {
    if (typeof size === 'object') {
        size = size.size;
    }
    const uploadFileSize = user.uploadFileSize;
    return uploadFileSize && size <= uploadFileSize;
};

const getRanzhiServerInfo = (user) => {
    const ranzhiUrl = user.ranzhiUrl;
    if (ranzhiUrl) {
        return Platform.net.getJSON(`${ranzhiUrl}/index.php?mode=getconfig`).then(json => {
            if (json && json.version) {
                json.url = ranzhiUrl;
                json.isPathInfo = json.requestType.toUpperCase() === 'PATH_INFO';
                return Promise.resolve(json);
            }
            return Promise.reject('WRONG_DATA');
        });
    }
    return Promise.reject('RANZHI_SERVER_NOTSET');
};

const API = {
    downloadFile: Platform.net.downloadFile,
    uploadFile: Platform.net.uploadFile,
    requestServerInfo,
    checkUploadFileSize,
    getRanzhiServerInfo,
    checkFileCache: Platform.net.checkFileCache || (() => false)
};

if (DEBUG) {
    global.$.API = API;
}

export default API;
