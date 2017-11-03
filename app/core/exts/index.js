import Lang from '../../lang';

const exts = [{
    name: 'home',
    display: Lang.string('exts.home.label'),
    description: Lang.string('exts.home.desc'),
    buildIn: {
        fixed: true,
        asDefault: true,
    },
    type: 'app',
    appIcon: 'mdi-apps',
    appAccentColor: '#6200ea',
    appType: 'insideView',
}, {
    name: 'extensions',
    display: Lang.string('exts.extensions.label'),
    description: Lang.string('exts.extensions.desc'),
    buildIn: {},
    type: 'app',
    appIcon: 'mdi-puzzle',
    appAccentColor: '#6200ea',
    appType: 'insideView',
}];

// TODO: Load other exts here

// Grouped extensions
const all = {
    exts,
    apps: exts.filter(x => x.type === 'app'),
    themes: exts.filter(x => x.type === 'theme'),
    plugins: exts.filter(x => x.type === 'plugin'),
};

const getExt = (name, type) => {
    if (type) {
        const allExts = all[`${type}s`];
        return allExts && allExts.find(x => x.name === name);
    }
    return exts.find(x => x.name === name);
};

const detaultApp = all.apps.find(x => x.buildIn && x.buildIn.asDefault) || exts.apps[0];
const getApp = name => (getExt(name, 'app'));
const getPlugin = name => (getExt(name, 'plugin'));
const getTheme = name => (getExt(name, 'theme'));

const defaultOpenedApp = {
    name: detaultApp.name,
    time: new Date().getTime(),
    app: detaultApp,
    fixed: true,
    openTime: 0,
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
const openApp = name => {
    let theOpenedApp = isAppOpen(name);
    if (!theOpenedApp) {
        const theApp = getApp(name);
        if (theApp) {
            theOpenedApp = {
                name,
                app: theApp,
                time: new Date().getTime(),
                openTime: 0,
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

    get all() {
        return all;
    },

    get currentOpenedApp() {
        return currentOpenedApp;
    },

    isAppOpen,
    openApp,
    closeApp,
    closeAllApp,

    getExt,
    getApp,
    getPlugin,
    getTheme,
};
