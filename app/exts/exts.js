import buildIns from './build-in';
import {createExtension} from './extension';
import Config from 'Config';

const exts = [];

buildIns.forEach(buildIn => {
    if (!buildIn.publisher) {
        buildIn.publisher = '易软天创';
    }
    if (!buildIn.author) {
        buildIn.author = '易软天创';
    }
    if (!buildIn.version) {
        buildIn.version = Config.pkg.version;
    }
    exts.push(createExtension(buildIn));
});

// TODO: Load other exts here

// Grouped extensions
const apps = exts.filter(x => x.type === 'app');
const themes = exts.filter(x => x.type === 'theme');
const plugins = exts.filter(x => x.type === 'plugin');

const getTypeList = type => {
    switch (type) {
    case 'app':
        return apps;
    case 'theme':
        return themes;
    case 'plugin':
        return plugins;
    default:
        return exts;
    }
};

const getExt = (name, type) => {
    return getTypeList(type).find(x => x.name === name);
};

const defaultApp = apps.find(x => x.buildIn && x.buildIn.asDefault) || exts.apps[0];
const getApp = name => (getExt(name, 'app'));
const getPlugin = name => (getExt(name, 'plugin'));
const getTheme = name => (getExt(name, 'theme'));

const search = (keys, type = 'app') => {
    keys = keys.trim().toLowerCase().split(' ');
    const result = [];
    getTypeList(type).forEach(theExt => {
        const score = theExt.getMatchScore(keys);
        if (score) {
            result.push({score, ext: theExt});
        }
    });
    result.sort((x, y) => y.score - x.score);
    return result.map(x => x.ext);
};

const searchApps = keys => {
    return search(keys);
};

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
    get defaultApp() {
        return defaultApp;
    },

    getTypeList,
    getExt,
    getApp,
    getPlugin,
    getTheme,

    search,
    searchApps,
};
