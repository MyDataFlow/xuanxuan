import network from '../common/network';
import fse from 'fs-extra';
import Request from 'request';

const downloadFileOrigin = network.downloadFile;

const downloadFile = (url, fileSavePath, beforeSend, onprogress) => {
    return downloadFileOrigin(url, beforeSend, onprogress).then(arrayBuffer => {
        return fse.outputFile(fileSavePath, new Buffer(arrayBuffer));
    });
};

network.downloadFile = downloadFile;

network.setOptionsFileter(options => {
    if(options && options.body instanceof FormData) {
        const formData = options.body;
        const form = {};
        for (let key of formData.keys()) {
            const values = formData.getAll(key);
            if(values.length > 1) {
                form[key] = values;
            } else {
                form[key] = values[0];
            }
        }
        delete options.body;
        options.form = form;
    }
    return options;
});

const nodeFetch = (url, options) => {
    return new Promise((resolve, reject) => {
        options = Object.assign({
            url,
            rejectUnauthorized: false
        }, options);
        Request(options, (error, response, body) => {
            if(error) {
                reject(error);
            } else {
                response.ok = response.statusMessage === 'OK';
                response.json = () => {
                    try {
                        const json = JSON.parse(body);
                        return Promise.resolve(json);
                    } catch (e) {
                        return Promise.reject(e);
                    }
                };
                response.text = () => {
                    return Promise.resolve(body);
                };
                if(DEBUG) {
                    console.log('Request.options', options);
                    console.log('Request.response', response);
                    console.log('Request.body', body);
                }
                resolve(response);
            }
        });
    });
};

network.setFetchObject(nodeFetch);

network.uploadFile = (user, file, data = {}, onProgress = null) => {
    return new Promise((resolve, reject) => {
        const serverUrl = user.uploadUrl;
        const onFileBufferData = fileBufferData => {
            const filename = file.name;
            const headers = {'Content-Type': 'multipart/form-data'};
            headers['ServerName'] = user.serverName;
            headers['Authorization'] = user.token;

            const multipart = {
                chunked: false,
                data: [
                    {
                        'Content-Disposition': 'form-data; name="file"; filename="' + filename + '"',
                        body: fileBufferData
                    }, {
                        'Content-Disposition': 'form-data; name="userID"',
                        body: user.id
                    }
                ]
            };
            if(data.gid) {
                multipart.data.push({
                    'Content-Disposition': 'form-data; name="gid"',
                    body: data.gid
                });
            }
            const requestOptions = {
                method: 'POST',
                uri: serverUrl,
                headers,
                rejectUnauthorized: false,
                multipart
            };
            let onProgressTimer = null;
            if(onProgress) {
                let progress = 0;
                onProgressTimer = setInterval(() => {
                    progress += (100 - progress)/10;
                    onProgress(progress);
                }, 1000);
            }
            Request(requestOptions, (error, response, body) => {
                setTimeout(() => {
                    if(onProgressTimer) {
                        clearInterval(onProgressTimer);
                    }
                    let json = null;
                    if(error) {
                        error.code = 'WRONG_CONNECT';
                    } else if(response.statusCode === 200) {
                        try {
                            let bodyJson = JSON.parse(body);
                            if(bodyJson.result === 'success' && bodyJson.data) {
                                bodyJson = bodyJson.data;
                                json = Array.isArray(bodyJson) && bodyJson.length === 1 ? bodyJson[0] : bodyJson;
                            } else {
                                error = new Error('Server return wrong data.');
                                error.code = 'WRONG_DATA';
                            }
                        } catch(err) {
                            if(body.indexOf("user-deny-attach-upload") > 0) {
                                err.code = 'USER_DENY_ATTACT_UPLOAD';
                            } else {err.code = 'WRONG_DATA';}
                            error = err;
                        }
                    } else {
                        error = new Error('Status code is not 200.');
                        error.response = response;
                        error.code = 'WRONG_DATA';
                    }
                    if(DEBUG) {
                        console.collapse('HTTP UPLOAD Request', 'blueBg', serverUrl, 'bluePale', error ? 'ERROR' : 'OK', error ? 'redPale' : 'greenPale');
                        console.log('files', file);
                        console.log('response', response);
                        console.log('body', body);
                        if(error) console.error('error', error);
                        console.groupEnd();
                    }

                    if(!error && (!json || !json.id)) {
                        error = new Error('File data is incorrect.');
                        error.response = response;
                        error.code = 'WRONG_DATA';
                    }

                    if(error) reject(error);
                    else resolve(json);
                }, DEBUG ? 5000 : 0);
            });
        };
        const fileBufferData = fse.readFileSync(file.path);
        onFileBufferData(fileBufferData);
    });
};

export default network;
