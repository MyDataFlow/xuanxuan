import Platform from 'Platform';
import md5 from 'md5';

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
        ]
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

const uploadFile = (user, file, data = {}, onProgress = null) => Platform.net.uploadFile(user, file, data, onProgress);

const createFileDownloadUrl = (user, file) => user.makeServerUrl(`download?fileName=${encodeURIComponent(file.name)}&time=${file.time || 0}&id=${file.id}&ServerName=${user.serverName}&gid=${user.id}&sid=${md5(user.sessionID + file.name)}`);

const downloadFile = (user, file, onProgress = null) => {
    if (!file.url) {
        const url = createFileDownloadUrl(user, file);
        file.url = url;
    }
    return Platform.net.downloadFile(user, file, onProgress);
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

const ranzhiServerLogin = (user, password) => getRanzhiServerInfo(user).then(ranzhi => {
    const loginUrl = ranzhi.isPathInfo ? `${ranzhi.url}/sys/user${ranzhi.requestFix}login.json&lang=zh-cn&${ranzhi.sessionVar}=${ranzhi.sessionID}` : `${ranzhi.url}/sys/?${ranzhi.moduleVar}=user&${ranzhi.methodVar}=login&lang=zh-cn&${ranzhi.viewVar}=json&${ranzhi.sessionVar}=${ranzhi.sessionID}`;
    const passwordMd5 = md5(md5(md5(password) + user.account) + ranzhi.random);
    const form = new FormData();
    form.append('account', user.account);
    form.append('password', passwordMd5);
    return Platform.net.postJSONData(loginUrl, form).then(data => {
        ranzhi.loginResult = data;
        return Promise.resolve(ranzhi);
    });
});

const changeRanzhiUserPassword = (user, oldPassword, newPassword) => {
    const ranzhiUrl = user.ranzhiUrl;
    if (ranzhiUrl) {
        return ranzhiServerLogin(user, oldPassword).then(ranzhi => {
            const url = ranzhi.isPathInfo ? `${ranzhi.url}/sys/user${ranzhi.requestFix}changePassword.json&${ranzhi.sessionVar}=${ranzhi.sessionID}` : `${ranzhi.url}/sys/?${ranzhi.moduleVar}=user&${ranzhi.methodVar}=changePassword&${ranzhi.viewVar}=json&${ranzhi.sessionVar}=${ranzhi.sessionID}`;
            const form = new FormData();
            form.append('password1', newPassword);
            form.append('password2', newPassword);
            return Platform.net.postJSONData(url, form).then(data => Promise.resolve(ranzhi));
        });
    }
    return Promise.reject('RANZHI_SERVER_NOTSET');
};

const API = {
    downloadFile,
    uploadFile,
    requestServerInfo,
    checkUploadFileSize,
    createFileDownloadUrl,
    getRanzhiServerInfo,
    ranzhiServerLogin,
    changeRanzhiUserPassword,
    isFileExists: Platform.net.isFileExists || (() => false)
};

if (DEBUG) {
    global.$.API = API;
}

export default API;
