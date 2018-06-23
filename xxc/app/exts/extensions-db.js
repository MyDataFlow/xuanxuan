import Store from '../utils/store';
import {createExtension} from './extension';

const STORE_KEY = 'EXTENSIONS::database';

let onChangeListener = null;

const installs = Store.get(STORE_KEY, []).map(data => {
    return createExtension(data);
});

const saveToStore = () => {
    Store.set(STORE_KEY, installs.map(x => x.storeData));
};

const getInstall = name => {
    return installs.find(x => x.name === name);
};

const getInstallIndex = name => {
    return installs.findIndex(x => x.name === name);
};

const saveInstall = (extension, override = false, beforeSave = null) => {
    if (extension.isRemote) {
        if (onChangeListener) {
            onChangeListener(extension, 'update');
        }
        return Promise.resolve(extension);
    }
    const oldExtensionIndex = getInstallIndex(extension.name);
    if (oldExtensionIndex > -1) {
        if (!override) {
            return Promise.reject('EXT_NAME_ALREADY_INSTALLED');
        }
        const oldExtension = installs[oldExtensionIndex];
        extension._data = Object.assign(oldExtension.data, extension._data);
        extension.updateTime = new Date().getTime();
        installs.splice(oldExtensionIndex, 1, extension);
    } else {
        if (extension.installTime === undefined) {
            extension.installTime = new Date().getTime();
        }
        installs.push(extension);
    }
    if (beforeSave) {
        beforeSave(extension);
    }
    saveToStore();
    if (onChangeListener) {
        onChangeListener(extension, oldExtensionIndex > -1 ? 'update' : 'add');
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
