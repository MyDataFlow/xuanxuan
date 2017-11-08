import buildIns from './build-in';
import {createExtension} from './extension';
import Config from 'Config';
import db from './extensions-db';
import Events from '../core/events';

const EVENT = {
    onChange: 'Extension.onChange'
};

const exts = [];

buildIns.forEach((buildIn, idx) => {
    if (!buildIn.publisher) {
        buildIn.publisher = '易软天创';
    }
    if (!buildIn.author) {
        buildIn.author = '易软天创';
    }
    if (!buildIn.version) {
        buildIn.version = Config.pkg.version;
    }
    exts.push(createExtension(buildIn, {installTime: idx}));
});

// TODO: Load other exts here
exts.push(...db.installs);

exts.sort((x, y) => (x.installTime - y.installTime));

// Grouped extensions
let apps = exts.filter(x => x.type === 'app');
let themes = exts.filter(x => x.type === 'theme');
let plugins = exts.filter(x => x.type === 'plugin');

db.setOnChangeListener((ext, changeAction) => {
    if (changeAction === 'add') {
        exts.splice(0, 0, ext);
    } else if (changeAction === 'remove') {
        const index = exts.findIndex(x => x.name === ext.name);
        if (index > -1) {
            exts.splice(index, 1);
        }
    }
    apps = exts.filter(x => x.type === 'app');
    themes = exts.filter(x => x.type === 'theme');
    plugins = exts.filter(x => x.type === 'plugin');
    Events.emit(EVENT.onChange, ext, changeAction);
});

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

const onExtensionChange = listener => {
    return Events.on(EVENT.onChange, listener);
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
    onExtensionChange,
};
