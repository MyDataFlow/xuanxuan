import {detaultApp, getApp} from './exts';

const defaultOpenedApp = {
    name: detaultApp.name,
    time: new Date().getTime(),
    app: detaultApp,
    fixed: true,
    openTime: 0,
    embed: {tab: true}
};
const openedApps = [
    defaultOpenedApp,
];
const isAppOpen = name => {
    return openedApps.find(x => x.name === name);
};
const getOpenedAppIndex = name => {
    return openedApps.findIndex(x => x.name === name);
};
let currentOpenedApp = null;
const openApp = (name, embedType = 'tab') => {
    let theOpenedApp = isAppOpen(name);
    if (!theOpenedApp) {
        const theApp = getApp(name);
        if (theApp) {
            theOpenedApp = {
                name,
                app: theApp,
                time: new Date().getTime(),
                openTime: 0,
                embedType,
            };
        } else {
            return false;
        }
    }
    theOpenedApp.openTime = new Date().getTime();
    const appRoutePaht = `#/exts/app/${theOpenedApp.name}`;
    if (!window.location.hash.startsWith(appRoutePaht)) {
        window.location.hash = appRoutePaht;
    }
    currentOpenedApp = theOpenedApp;
    return true;
};
const openNextApp = () => {
    let theMaxOpenTime = 0;
    let theMaxOpenedName = null;
    openedApps.forEach(theOpenedApp => {
        if (theOpenedApp.openTime > theMaxOpenTime) {
            theMaxOpenTime = theOpenedApp.openTime;
            theMaxOpenedName = theOpenedApp.name;
        }
    });
    openApp(theMaxOpenedName || defaultOpenedApp.name);
};
const closeApp = (name, openNext = true) => {
    const theOpenedAppIndex = getOpenedAppIndex(name);
    if (theOpenedAppIndex > -1) {
        openedApps.splice(theOpenedAppIndex, 1);
        if (openNext) {
            openNextApp();
        }
    } else {
        return false;
    }
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
        return currentOpenedApp;
    },

    isAppOpen,
    openApp,
    closeApp,
    closeAllApp,
};
