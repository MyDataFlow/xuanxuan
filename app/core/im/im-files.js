import chats from './im-chats';
import FileData from '../models/file-data';

const loadFiles = (category = '', limit = 0, offset = 0, reverse = true, returnCount = false) => {
    category = category ? category.toLowerCase() : false;
    return chats.loadChatMessages(null, x => x.contentType === 'file', limit, offset, reverse, true, true, returnCount).then(data => {
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

export default {
    loadFiles,
    search,
};
