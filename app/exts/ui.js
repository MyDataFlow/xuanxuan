import {defaultApp, getApp} from './exts';
import OpenedApp from './opened-app';
import Lang from '../lang';
import manager from './manager';
import App from '../core';

const defaultOpenedApp = new OpenedApp(defaultApp);

const openedApps = [
    defaultOpenedApp,
];

const isDefaultApp = id => {
    return id === defaultOpenedApp.id;
};

const isAppOpen = id => {
    return openedApps.find(x => x.id === id);
};

const getOpenedAppIndex = id => {
    return openedApps.findIndex(x => x.id === id);
};

let currentOpenedApp = null;
const isCurrentOpenedApp = id => {
    return currentOpenedApp && currentOpenedApp.id === id;
};

const openApp = (name, pageName = null, params = null) => {
    if (name instanceof OpenedApp) {
        const app = name;
        name = app.appName;
        params = pageName;
        pageName = app.pageName;
    }

    const id = OpenedApp.createId(name, pageName);
    let theOpenedApp = isAppOpen(id);
    if (!theOpenedApp) {
        const theApp = getApp(name);
        if (theApp) {
            theOpenedApp = new OpenedApp(theApp, pageName, params);
            openedApps.push(theOpenedApp);
        } else {
            if (DEBUG) {
                console.color('Extension', 'greenBg', name, 'redPale', `Cannot open app '${name}', because cannot find it.`);
            }
            return false;
        }
    }
    theOpenedApp.updateOpenTime();
    if (params !== null) theOpenedApp.params = params;
    const appRoutePaht = theOpenedApp.hashRoute;
    if (!window.location.hash.startsWith(appRoutePaht)) {
        window.location.hash = appRoutePaht;
    }
    currentOpenedApp = theOpenedApp;
    if (DEBUG) {
        console.collapse('Extension', 'greenBg', id, 'greenPale', 'Opened', 'green');
        console.trace('app', theOpenedApp);
        console.groupEnd();
    }
    return true;
};

const openAppById = (id, params = null) => {
    let name = id;
    let pageName = null;
    const indexOfAt = id.indexOf('@');
    if (indexOfAt > 0) {
        name = id.substr(0, indexOfAt);
        pageName = id.substr(indexOfAt + 1);
    }
    return openApp(name, pageName, params);
};

const openNextApp = () => {
    let theMaxOpenTimeApp = null;
    openedApps.forEach(theOpenedApp => {
        if (!theMaxOpenTimeApp || theOpenedApp.openTime > theMaxOpenTimeApp.openTime) {
            theMaxOpenTimeApp = theOpenedApp;
        }
    });
    theMaxOpenTimeApp = theMaxOpenTimeApp || defaultOpenedApp;
    openApp(theMaxOpenTimeApp);
};

const closeApp = (id, openNext = true) => {
    const theOpenedAppIndex = getOpenedAppIndex(id);
    if (theOpenedAppIndex > -1) {
        openedApps.splice(theOpenedAppIndex, 1);
        if (isCurrentOpenedApp(id)) {
            currentOpenedApp = null;
            if (openNext) {
                openNextApp();
                return true;
            }
        }
        return 'refresh';
    }
    return false;
};

const closeAllApp = () => {
    openedApps.map(x => x.name).forEach(theOpenedApp => {
        if (!theOpenedApp.fixed) {
            closeApp(theOpenedApp.name, false);
        }
    });
};

const uninstallExtension = (extension, confirm = true, callback = null) => {
    if (typeof confirm === 'function') {
        callback = confirm;
        confirm = true;
    }
    if (confirm) {
        return App.ui.modal.confirm(Lang.format('ext.uninstallConfirm.format', extension.displayName)).then(confirmed => {
            if (confirmed) {
                return uninstallExtension(extension, false, callback);
            }
            return Promise.reject();
        });
    }
    return manager.uninstall(extension).then(x => {
        App.ui.showMessger(Lang.format('ext.uninstallSuccess.format', extension.displayName), {type: 'success'});
        if (callback) {
            callback();
        }
    }).catch(error => {
        if (error) {
            App.ui.showMessger(Lang.error(error), {type: 'danger'});
        }
    });
};

const installExtension = () => {
    manager.openInstallDialog((extension, error) => {
        if (extension) {
            App.ui.showMessger(Lang.format('ext.installSuccess.format', extension.displayName), {type: 'success'});
        } else {
            let msg = Lang.string('ext.installFail');
            if (error) {
                msg += Lang.error(error);
            }
            App.ui.showMessger(msg, {type: 'danger'});
        }
    });
};

const createSettingContextMenu = extension => {
    const items = [];
    if (extension.isApp) {
        items.push({
            label: Lang.string('ext.openApp'),
            click: openApp.bind(null, extension.name)
        });
    }
    if (extension.buildIn) {
        items.push({
            label: Lang.string('ext.cannotUninstallBuidIn'),
            disabled: true,
        });
    } else {
        items.push({
            label: Lang.string('ext.uninstall'),
            click: () => {
                uninstallExtension(extension);
            }
        });
    }
    return items;
};

export default {
    get openedApps() {
        return openedApps;
    },

    get currentOpenedApp() {
        return currentOpenedApp || defaultOpenedApp;
    },

    get defaultOpenedApp() {
        return defaultOpenedApp;
    },

    isDefaultApp,
    isCurrentOpenedApp,
    isAppOpen,
    openApp,
    openAppById,
    closeApp,
    closeAllApp,

    createSettingContextMenu,

    typeColors: {
        app: '#304ffe',
        theme: '#f50057',
        plugin: '#00c853',
    },

    installExtension,
    uninstallExtension,
};
