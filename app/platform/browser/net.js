import network from '../common/network';

network.downloadFile = (user, file, onProgress) => {
    if(file.url) {
        file.src = file.url;
    }
    return Promise.resolve(file);
};

const uploadFileOrigin = network.uploadFile;

network.uploadFile = (user, file, data = {}, onProgress = null) => {
    const serverUrl = user.uploadUrl;
    const form = new FormData();
    form.append('file', file.blob || file, file.name);
    form.append('userID', user.id);
    if(data.gid) {
        form.append('gid', data.gid);
    }
    file.form = form;
    return uploadFileOrigin(file, serverUrl, xhr => {
        xhr.setRequestHeader('ServerName', user.serverName);
        xhr.setRequestHeader('Authorization', user.token);
    }, onProgress);
};

export default network;
