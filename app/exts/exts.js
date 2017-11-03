import buildIns from './build-in';

const exts = [];
exts.push(...buildIns);

// TODO: Load other exts here

// Grouped extensions
const apps = exts.filter(x => x.type === 'app');
const themes = exts.filter(x => x.type === 'theme');
const plugins = exts.filter(x => x.type === 'plugin');

const getExt = (name, type) => {
    switch (type) {
    case 'app':
        return apps.find(x => x.name === name);
    case 'theme':
        return themes.find(x => x.name === name);
    case 'plugin':
        return plugins.find(x => x.name === name);
    default:
        return type ? apps.find(x => x.name === name && x.type === type) : apps.find(x => x.name === name);
    }
};

const detaultApp = apps.find(x => x.buildIn && x.buildIn.asDefault) || exts.apps[0];
const getApp = name => (getExt(name, 'app'));
const getPlugin = name => (getExt(name, 'plugin'));
const getTheme = name => (getExt(name, 'theme'));

export default {
    get exts() {
        return exts;
    },
    get apps() {
        return apps;
    },
    get themes() {
        return themes;
    },
    get plugins() {
        return plugins;
    },
    get detaultApp() {
        return detaultApp;
    },

    getExt,
    getApp,
    getPlugin,
    getTheme,
};
