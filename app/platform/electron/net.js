import fse from 'fs-extra';
import Request from 'request';
import Path from 'path';
import uuid from 'uuid/v4';
import network from '../common/network';
import {userDataPath} from './ui';

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
network.isFileExists = isFileExists;

const downloadFileOrigin = network.downloadFile;

const downloadFileWithRequest = (user, url, fileSavePath, onProgress) => {
    return new Promise((resolve, reject) => {
        const headers = {
            ServerName: user.serverName,
            Authorization: user.token
        };
        const requestOptions = {
            url,
            headers,
            rejectUnauthorized: false,
        };
        let onProgressTimer = null;
        if (onProgress) {
            let progress = 0;
            onProgress(0);
            onProgressTimer = setInterval(() => {
                progress += (100 - progress) / 20;
                onProgress(progress);
            }, 1000);
        }
        Request.get(requestOptions, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                error = error || new Error('Status code is not 200.');
                if (DEBUG) {
                    console.collapse('HTTP DOWNLOAD', 'blueBg', url, 'bluePale', error ? 'ERROR' : 'OK', error ? 'redPale' : 'greenPale');
                    console.log('response', response);
                    console.log('body', body);
                    if (error) console.error('error', error);
                    console.groupEnd();
                }
                if (error) {
                    if (onProgressTimer) {
                        clearInterval(onProgressTimer);
                    }
                    reject(error);
                }
            }
        }).on('error', error => {
            if (onProgressTimer) {
                clearInterval(onProgressTimer);
            }
            reject(error);
        }).on('end', () => {
            if (onProgressTimer) {
                onProgress(100);
                clearInterval(onProgressTimer);
            }
            setTimeout(resolve, 100);
            if (DEBUG) {
                console.collapse('HTTP DOWNLOAD', 'blueBg', url, 'bluePale', 'OK', 'greenPale');
                console.log('path', fileSavePath);
                console.groupEnd();
            }
        }).pipe(fse.createWriteStream(fileSavePath));
    });
};

const createImageFilePath = (user, file) => {
    return Path.join(userDataPath, 'users', user.identify, 'images', file.name);
};

const downloadFile = (user, file, onProgress) => {
    const fileSavePath = file.path || createImageFilePath(user, file);
    return fse.pathExists(fileSavePath).then(exists => {
        if (exists) {
            file.src = fileSavePath;
            return Promise.resolve(file);
        }
        fse.ensureDirSync(Path.dirname(fileSavePath));
        return downloadFileWithRequest(user, file.url, fileSavePath, onProgress).then(() => {
            saveLocalFile(file, user, fileSavePath);
            file.src = fileSavePath;
            return Promise.resolve(file);
        });
    });
};

network.downloadFile = downloadFile;

network.setOptionsFileter(options => {
    if (options && options.body instanceof FormData) {
        const formData = options.body;
        const form = {};
        for (let key of formData.keys()) {
            const values = formData.getAll(key);
            if (values.length > 1) {
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
            if (error) {
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
                resolve(response);
            }
        });
    });
};

network.setFetchObject(nodeFetch);

network.uploadFile = (user, file, data = {}, onProgress = null) => {
    return new Promise((resolve, reject) => {
        const serverUrl = user.uploadUrl;
        const filename = data.copy ? `${uuid()}${Path.extname(file.name)}` : file.name;
        const copyPath = data.copy ? createImageFilePath(user, {name: filename}) : null;
        const onFileBufferData = fileBufferData => {
            const headers = {'Content-Type': 'multipart/form-data'};
            headers.ServerName = user.serverName;
            headers.Authorization = user.token;

            const multipart = {
                chunked: false,
                data: [
                    {
                        'Content-Disposition': `form-data; name="file"; filename="${filename}"`,
                        body: fileBufferData
                    }, {
                        'Content-Disposition': 'form-data; name="userID"',
                        body: user.id
                    }
                ]
            };
            if (data.gid) {
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
            if (onProgress) {
                let progress = 0;
                onProgressTimer = setInterval(() => {
                    progress += (100 - progress) / 20;
                    onProgress(progress);
                }, 1000);
            }
            Request(requestOptions, (error, response, body) => {
                if (onProgressTimer) {
                    clearInterval(onProgressTimer);
                }
                let json = null;
                if (error) {
                    error.code = 'WRONG_CONNECT';
                } else if (response.statusCode === 200) {
                    try {
                        let bodyJson = JSON.parse(body);
                        if (bodyJson.result === 'success' && bodyJson.data) {
                            bodyJson = bodyJson.data;
                            json = Array.isArray(bodyJson) && bodyJson.length === 1 ? bodyJson[0] : bodyJson;
                        } else {
                            error = new Error('Server return wrong data.');
                            error.code = 'WRONG_DATA';
                        }
                    } catch (err) {
                        if (body.indexOf('user-deny-attach-upload') > 0) {
                            err.code = 'USER_DENY_ATTACT_UPLOAD';
                        } else {err.code = 'WRONG_DATA';}
                        error = err;
                    }
                } else {
                    error = new Error('Status code is not 200.');
                    error.response = response;
                    error.code = 'WRONG_DATA';
                }
                if (DEBUG) {
                    console.collapse('HTTP UPLOAD Request', 'blueBg', serverUrl, 'bluePale', error ? 'ERROR' : 'OK', error ? 'redPale' : 'greenPale');
                    console.log('files', file);
                    console.log('response', response);
                    console.log('body', body);
                    if (error) console.error('error', error);
                    console.groupEnd();
                }

                if (!error && (!json || !json.id)) {
                    error = new Error('File data is incorrect.');
                    error.response = response;
                    error.code = 'WRONG_DATA';
                }

                if (error) reject(error);
                else resolve(Object.assign(json, {name: filename}));
            });
        };
        if (file.path) {
            if (data.copy) {
                fse.copySync(file.path, copyPath);
                saveLocalFile(file, user, copyPath);
            }
            const fileBufferData = fse.readFileSync(file.path);
            onFileBufferData(fileBufferData);
        } else if (file.blob) {
            const fileReader = new FileReader();
            fileReader.onload = e => {
                const result = fileReader.result;
                if (data.copy) {
                    fse.outputFile(copyPath, new Buffer(result));
                }
                onFileBufferData(result);
            };
            fileReader.readAsArrayBuffer(file.blob);
        } else if (DEBUG) {
            throw new Error('Cannot upload file, becase file object is not valid.', file);
        }
    });
};

export default network;
