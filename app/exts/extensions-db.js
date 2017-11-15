import Store from '../utils/store';
import {createExtension} from './extension';

const STORE_KEY = 'EXTENSIONS::database';

let onChangeListener = null;

const installs = Store.get(STORE_KEY, []).map(createExtension);

const saveToStore = () => {
    Store.set(STORE_KEY, installs.map(x => x.pkg));
};

const getInstall = name => {
    return installs.find(x => x.name === name);
};

const getInstallIndex = name => {
    return installs.findIndex(x => x.name === name);
};

const saveInstall = extension => {
    const alreadyInstalled = getInstall(extension.name);
    if (alreadyInstalled) {
        return Promise.reject('EXT_NAME_ALREADY_INSTALLED');
    }
    if (extension.installTime === undefined) {
        extension.installTime = new Date().getTime();
    }
    installs.push(extension);
    saveToStore();
    if (onChangeListener) {
        onChangeListener(extension, 'add');
    }
    return Promise.resolve(extension);
};

const removeInstall = extension => {
    const index = getInstallIndex(extension.name);
    if (index < 0) {
        return Promise.reject('EXT_NOT_FOUND');
    }
    installs.splice(index, 1);
    saveToStore();
    if (onChangeListener) {
        onChangeListener(extension, 'remove');
    }
    return Promise.resolve();
};

const removeInstallByName = name => {
    const extension = getInstall(name);
    if (extension) {
        return removeInstall(extension);
    }
    return Promise.reject('EXT_NOT_FOUND');
};

const setOnChangeListener = listener => {
    onChangeListener = listener;
};

export default {
    get installs() {
        return installs;
    },

    getInstall,
    saveInstall,
    removeInstall,
    setOnChangeListener,
    removeInstallByName,
};
