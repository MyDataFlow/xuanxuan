import chats from './im-chats';
import Events from '../events';
import profile from '../profile';
import API from '../../network/api';
import FileData from '../models/file-data';

// const EVENT = {
//     upload: 'im.file.upload',
//     download: 'im.file.download'
// };

const MIN_PROGRESS_CHANGE_INTERVAL = 1000;

/**
 * Check upload file size
 * @param {User} user
 * @param {number} size
 */
const checkUploadFileSize = (size) => {
    if (typeof size === 'object') {
        size = size.size;
    }
    const uploadFileSize = profile.user.uploadFileSize;
    return uploadFileSize && size <= uploadFileSize;
};

const loadFiles = (category = '', limit = 0, offset = 0, reverse = true, returnCount = false) => {
    category = category ? category.toLowerCase() : false;
    return chats.getChatMessages(null, x => x.contentType === 'file', limit, offset, reverse, true, true, returnCount).then(data => {
        if (data && data.length) {
            const files = data.map(x => FileData.create(JSON.parse(x.content))).filter(x => ((!category || x.category === category) && x.isOK));
            return Promise.resolve(files);
        }
        return Promise.resolve([]);
    });
};

const search = (keys, category = '') => {
    return loadFiles(category).then(files => {
        keys = keys ? keys.trim().toLowerCase().split(' ') : null;
        if (keys && keys.length) {
            const result = [];
            files.forEach(file => {
                const score = file.getMatchScore(keys);
                if (score) {
                    result.push({score, file});
                }
            });
            result.sort((x, y) => y.score - x.score);
            return Promise.resolve(result.map(x => x.file));
        }
        return Promise.resolve(files);
    });
};

const uploadFile = (file, onProgress, copyCache) => {
    file = FileData.create(file);
    let progressTime = 0, lastProgress = 0;
    return API.uploadFile(profile.user, file, progress => {
        const now = new Date().getTime();
        if (progress !== lastProgress && (now - progressTime) > MIN_PROGRESS_CHANGE_INTERVAL) {
            progressTime = now;
            lastProgress = progress;
            if (onProgress) {
                onProgress(progress, file);
            }
        }
    }, copyCache);
};

const uploadImageFile = (file, onProgress) => {
    return uploadFile(file, onProgress, true);
};

const downloadFile = (file, onProgress) => {
    file = FileData.create(file);
    return API.downloadFile(profile.user, file, onProgress);
};

const checkCache = file => {
    return API.checkFileCache(file, profile.user);
};

export default {
    loadFiles,
    downloadFile,
    search,
    uploadFile,
    uploadImageFile,
    checkUploadFileSize,
    checkCache
};
