import Platform from 'Platform';
import Path from 'path';
import {defaultApp, getApp} from './exts';
import OpenedApp from './opened-app';
import Lang from '../lang';
import manager from './manager';
import App from '../core';
import ExtensionDetailDialog from '../views/exts/extension-detail-dialog';

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
            if (DEBUG) {
                console.collapse('Extension Open App', 'greenBg', id, 'greenPale');
                console.trace('app', theOpenedApp);
                console.groupEnd();
            }
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
        console.collapse('Extension Active App', 'greenBg', id, 'greenPale');
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

const installExtension = (devMode = false) => {
    manager.openInstallDialog((extension, error) => {
        if (extension) {
            App.ui.showMessger(Lang.format('ext.installSuccess.format', extension.displayName), {type: 'success'});
        } else if (error) {
            let msg = Lang.string('ext.installFail');
            if (error) {
                msg += Lang.error(error);
            }
            App.ui.showMessger(msg, {type: 'danger'});
        }
    }, devMode);
};

const showExtensionDetailDialog = (extension, callback) => {
    return ExtensionDetailDialog.show(extension, callback);
};

const createSettingContextMenu = extension => {
    const items = [];
    if (extension.isApp) {
        items.push({
            label: Lang.string('ext.openApp'),
            click: openApp.bind(null, extension.name, null, null)
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

const showDevFolder = extension => {
    const localPath = extension.localPath;
    if (localPath) {
        Platform.ui.showItemInFolder(Path.join(localPath, 'package.json'));
        return true;
    }
    return false;
};

const createAppContextMenu = appExt => {
    const items = [];
    items.push({
        label: Lang.string('ext.app.open'),
        click: () => {
            openApp(appExt.name);
        }
    });
    if (appExt.webViewUrl && !appExt.isLocalWebView) {
        items.push({
            label: Lang.string('ext.app.openInBrowser'),
            click: () => {
                Platform.ui.openExternal(appExt.webViewUrl);
            }
        });
    }
    if (!appExt.buildIn) {
        if (items.length && items[items.length - 1].type !== 'separator') {
            items.push({type: 'separator'});
        }
        items.push({
            label: Lang.string('ext.uninstall'),
            click: () => {
                uninstallExtension(appExt);
            }
        });
    }
    if (items.length && items[items.length - 1].type !== 'separator') {
        items.push({type: 'separator'});
    }
    items.push({
        label: Lang.string('ext.app.about'),
        click: () => {
            showExtensionDetailDialog(appExt);
        }
    });
    return items;
};

const createOpenedAppContextMenu = (theOpenedApp, refreshUI) => {
    const items = [];
    if (theOpenedApp.webview) {
        items.push({
            label: Lang.string('ext.app.refresh'),
            click: () => {
                if (theOpenedApp.webview) {
                    theOpenedApp.webview.reload();
                }
            }
        });
        items.push({
            label: Lang.string('ext.app.goBack'),
            disabled: !theOpenedApp.webview.canGoBack(),
            click: () => {
                if (theOpenedApp.webview) {
                    theOpenedApp.webview.goBack();
                }
            }
        });
        items.push({
            label: Lang.string('ext.app.goForward'),
            disabled: !theOpenedApp.webview.canGoForward(),
            click: () => {
                if (theOpenedApp.webview) {
                    theOpenedApp.webview.goForward();
                }
            }
        });
    }
    if (theOpenedApp.id !== defaultOpenedApp.id) {
        if (items.length) {
            items.push({type: 'separator'});
        }
        items.push({
            label: Lang.string('ext.app.close'),
            click: () => {
                closeApp(theOpenedApp.name);
                if (refreshUI) {
                    refreshUI();
                }
            }
        });
    }
    const appExt = theOpenedApp.app;
    if (appExt.webViewUrl && !appExt.isLocalWebView) {
        if (items.length && items[items.length - 1].type !== 'separator') {
            items.push({type: 'separator'});
        }
        items.push({
            label: Lang.string('ext.app.openInBrowser'),
            click: () => {
                Platform.ui.openExternal(appExt.webViewUrl);
            }
        });
    }

    if (DEBUG && theOpenedApp.webview) {
        if (items.length && items[items.length - 1].type !== 'separator') {
            items.push({type: 'separator'});
        }
        items.push({
            label: Lang.string('ext.app.openDevTools'),
            click: () => {
                theOpenedApp.webview.openDevTools();
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

    showDevFolder,
    createAppContextMenu,
    showExtensionDetailDialog,
    createOpenedAppContextMenu,
};
