import network from '../common/network';
import fs from 'fs-extra';
import Request from 'request';

const downloadFileOrigin = network.downloadFile;

const downloadFile = (url, fileSavePath, beforeSend, onprogress) => {
    return downloadFileOrigin(url, beforeSend, onprogress).then(arrayBuffer => {
        return fs.outputFile(fileSavePath, new Buffer(arrayBuffer));
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
                // if(DEBUG) {
                //     console.log('Request.options', options);
                //     console.log('Request.response', response);
                //     console.log('Request.body', body);
                // }
                resolve(response);
            }
        });
    });
};

network.setFetchObject(nodeFetch);

export default network;
