import network from '../common/network';
import fs from 'fs-extra';

const downloadFileOrigin = network.downloadFile;

const downloadFile = (url, fileSavePath, beforeSend, onprogress) => {
    return downloadFileOrigin(url, beforeSend, onprogress).then(arrayBuffer => {
        return fs.outputFile(fileSavePath, new Buffer(arrayBuffer));
    });
};

network.downloadFile = downloadFile;

export default network;
