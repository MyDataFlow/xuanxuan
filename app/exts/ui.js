import {detaultApp, getApp} from './exts';

const defaultApp = {
    name: detaultApp.name,
    time: new Date().getTime(),
    app: detaultApp,
    fixed: true,
    openTime: 0,
    embed: {tab: true}
};

const openedApps = [
    defaultApp,
];

const isDefaultApp = name => {
    return name === defaultApp.name;
};

const isAppOpen = name => {
    return openedApps.find(x => x.name === name);
};

const getOpenedAppIndex = name => {
    return openedApps.findIndex(x => x.name === name);
};

let currentOpenedApp = null;
const isCurrentOpenedApp = name => {
    return currentOpenedApp && currentOpenedApp.name === name;
};

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
            openedApps.push(theOpenedApp);
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
    openApp(theMaxOpenedName || defaultApp.name);
};

const closeApp = (name, openNext = true) => {
    const theOpenedAppIndex = getOpenedAppIndex(name);
    if (theOpenedAppIndex > -1) {
        openedApps.splice(theOpenedAppIndex, 1);
        if (isCurrentOpenedApp(name)) {
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
        return currentOpenedApp || defaultApp;
    },

    get defaultApp() {
        return defaultApp;
    },

    isDefaultApp,
    isCurrentOpenedApp,
    isAppOpen,
    openApp,
    closeApp,
    closeAllApp,
};
