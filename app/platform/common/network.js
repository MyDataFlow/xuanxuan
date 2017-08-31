import limitTimePromise from '../../utils/limit-time-promise';

const TIMEOUT_DEFAULT = 15*1000;

const request = (url, options) => {
    return new Promise((resolve, reject) => {
        fetch(url, options).then(response => {
            if(response.ok) {
                resolve(response);
            } else {
                let error = new Error('Status code is not 200.');
                error = 'WRONG_STATUS';
                reject(error);
            }
        }).catch(error => {
            error.code = 'WRONG_CONNECT';
            reject(error);
        });
    });
}

const getText = (url, options) => {
    return request(url, options).then(response => {
        return response.text();
    });
};


const getJSON = (url, options) => {
    return request(url, options).then(response => {
        return response.json();
    });
};

const getJSONData = (url, options) => {
    return getJSON(url, options).then(json => {
        if(json) {
            if(json.status === 'success') {
                return Promise.resolve(json.data);
            } else {
                let error = new Error(json.message || json.reason || `The server data status is ${json.status}`);
                error.code = 'WRONG_RESULT';
                return Promise.reject(error);
            }
        } else {
            let error = new Error('Server return a null json.');
            error.code = 'WRONG_DATA';
            return Promise.reject(error);
        }
    });
};

const postJSONData = (url, options) => {
    if(options instanceof FormData) {
        options = {body: options};
    }
    return getJSONData(url, Object.assign({
        method: 'POST',
    }, options));
};



const downloadFile = (url, beforeSend, onprogress) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onload = e => {
            if(xhr.status === 200) {
                let arrayBuffer = xhr.response;
                if (arrayBuffer) {
                    resolve(arrayBuffer);
                } else {
                    let error = new Error('File data is empty.');
                    error = 'EMPTY_FILE_DATA';
                    reject(error);
                }
            } else {
                let error = new Error('Status code is not 200.');
                error = 'WRONG_STATUS';
                reject(error);
            }
        };
        xhr.onprogress = e => {
            if (e.lengthComputable && onprogress) {
                onprogress(100*e.loaded/e.total);
            }
        };
        xhr.onerror = e => {
            let error = new Error('Download request error.');
            error.event = e;
            error.code = 'WRONG_CONNECT';
            reject(error);
        };
        xhr.onabort = e => {
            let error = new Error('Download request abort.');
            error.event = e;
            error.code = 'CONNECT_ABORT';
            reject(error);
        };

        xhr.open('GET', url);
        xhr.responseType = "arraybuffer";
        if(beforeSend) {
            beforeSend(xhr);
        }
        xhr.send();
    });
};

/**
 * Upload file to the server
 *
 * @param {object} file
 * @param {string} serverUrl
 * @param {Function} beforeSend
 * @param {Function} onProgress
 */
const uploadFile = (file, serverUrl, beforeSend = null, onProgress = null) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onload = e => {
            if(xhr.status === 200) {
                let bodyText = xhr.responseText;
                try {
                    let json = JSON.parse(bodyText);
                    if(json.result === 'success' && json.data) {
                        resolve(json.data);
                    } else {
                        let error = new Error(`The server returned wrong result: ${responseText}`);
                        error.code = 'WRONG_RESULT';
                        reject(error);
                    }
                } catch(err) {
                    if(bodyText.indexOf("user-deny-attach-upload") > 0) {
                        let error = new Error('Server denied the request.');
                        error.code = 'USER_DENY_ATTACT_UPLOAD';
                        reject(error);
                    } else {
                        let error = new Error('Unknown data content: ' + bodyText);
                        error.code = 'WRONG_DATA';
                        reject(error);
                    }
                }
            } else {
                let error = new Error('Status code is not 200.');
                error = 'WRONG_STATUS';
                reject(error);
            }
        };
        xhr.upload.onprogress = e => {
            if (e.lengthComputable && onprogress) {
                onprogress(100*e.loaded/e.total);
            }
        };
        xhr.onerror = e => {
            let error = new Error('Upload request error.');
            error.event = e;
            error.code = 'WRONG_CONNECT';
            reject(error);
        };
        xhr.onabort = e => {
            let error = new Error('Upload request abort.');
            error.event = e;
            error.code = 'CONNECT_ABORT';
            reject(error);
        };

        xhr.open('POST', serverUrl);
        xhr.setRequestHeader("X-FILENAME", encodeURIComponent(file.name));
        if(beforeSend) {
            beforeSend(xhr);
        }
        xhr.send(file.form || file);
    });
};

const timeout = (promise, timeout = TIMEOUT_DEFAULT, errorText = 'timeout') => {
    return limitTimePromise(promise, timeout, errorText);
};

export default {
    request,
    getText,
    getJSON,
    getJSONData,
    postJSONData,
    downloadFile,
    uploadFile,
    timeout
};
