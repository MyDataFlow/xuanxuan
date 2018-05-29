import network from '../common/network';

network.downloadFile = (user, file, onProgress) => {
    if (!file.url) {
        file.makeUrl(user);
    }
    return Promise.resolve(file);
};

const uploadFileOrigin = network.uploadFile;

network.uploadFile = (user, file, data = {}, onProgress = null) => {
    const originFile = file.originFile;
    if (!originFile) {
        return console.warn('Upload file fail, cannot get origin file object.', file);
    }
    const serverUrl = user.uploadUrl;
    const form = new FormData();
    form.append('file', file.originData, file.name);
    form.append('userID', user.id);
    form.append('gid', file.cgid);
    file.form = form;
    return uploadFileOrigin(file, serverUrl, xhr => {
        xhr.setRequestHeader('ServerName', user.serverName);
        xhr.setRequestHeader('Authorization', user.token);
    }, onProgress);
};

export default network;
