import {defaultApp, getApp} from './exts';
import OpenedApp from './opened-app';

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
};
