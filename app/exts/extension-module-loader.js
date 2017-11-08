import {env} from 'Platform';
import path from 'path';

export default (name, mainFile) => {
    /* eslint-disable */
    const jsFilePath = path.join(env.dataPath, 'xexts', 'name', mainFile);
    return __non_webpack_require__(path);
    /* eslint-enable */
};
