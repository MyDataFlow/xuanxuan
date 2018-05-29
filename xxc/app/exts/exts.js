import Config from 'Config';
import buildIns from './build-in/';
import {createExtension} from './extension';
import db from './extensions-db';
import Events from '../core/events';
import Lang from '../lang';

const EVENT = {
    onChange: 'Extension.onChange'
};

const exts = [];

const PKG = Config.pkg;

buildIns.forEach((buildIn, idx) => {
    if (!buildIn.publisher) {
        buildIn.publisher = Config.exts.buildInPublisher || Lang.string('app.company');
    }
    if (!buildIn.author) {
        buildIn.author = Config.exts.buildInAuthor || Lang.string('app.company');
    }
    ['version', 'license', 'homepage', 'bugs', 'repository'].forEach(key => {
        buildIn[key] = PKG[key];
    });
    exts.push(createExtension(buildIn, {installTime: idx}, true));
});

// Load user installed extensions
exts.push(...db.installs);

const sortExts = () => {
    exts.sort((x, y) => {
        let result = (y.isDev ? 1 : 0) - (x.isDev ? 1 : 0);
        if (result === 0) {
            result = (y.disabled ? 0 : 1) - (x.disabled ? 0 : 1);
        }
        if (result === 0) {
            result = y.installTime - x.installTime;
        }
        return result;
    });
};
sortExts();

// Grouped extensions
let apps = exts.filter(x => x.type === 'app');
let themes = exts.filter(x => x.type === 'theme');
let plugins = exts.filter(x => x.type === 'plugin');

db.setOnChangeListener((ext, changeAction) => {
    if (changeAction === 'add') {
        exts.splice(0, 0, ext);
        sortExts();
    } else if (changeAction === 'remove') {
        const index = exts.findIndex(x => x.name === ext.name);
        if (index > -1) {
            exts.splice(index, 1);
        }
    } else if (changeAction === 'update') {
        const index = exts.findIndex(x => x.name === ext.name);
        if (index > -1) {
            exts.splice(index, 1, ext);
        } else {
            exts.splice(0, 0, ext);
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

const forEach = (callback, includeDisabled = false) => {
    exts.forEach(x => {
        if (!x.disabled || includeDisabled) {
            callback(x);
        }
    });
};

if (DEBUG) {
    console.collapse('Extensions Init', 'greenBg', `Total: ${exts.length}, Apps: ${apps.length}, Plugins: ${plugins.length}, Themes: ${themes.length}`, 'greenPale');
    console.log('exts', exts);
    console.log('apps', apps);
    console.log('themes', themes);
    console.log('plugins', plugins);
    console.groupEnd();
}

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
    forEach,

    db: DEBUG ? db : null
};
