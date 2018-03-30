import {env, fs as fse} from 'Platform';
import Config, {updateConfig} from 'Config';
import path from 'path';
import Lang from '../../lang';

const exts = [{
    name: 'home',
    displayName: Lang.string('exts.home.label'),
    description: Lang.string('exts.home.desc'),
    buildIn: {
        fixed: true,
        asDefault: true,
    },
    type: 'app',
    appIcon: 'mdi-apps',
    appAccentColor: '#3f51b5',
    appType: 'insideView',
}, {
    name: 'extensions',
    displayName: Lang.string('exts.extensions.label'),
    description: Lang.string('exts.extensions.desc'),
    buildIn: {},
    type: 'app',
    appIcon: 'mdi-puzzle',
    appAccentColor: '#00c853',
    appType: 'insideView',
}, {
    name: 'themes',
    displayName: Lang.string('exts.themes.label'),
    description: Lang.string('exts.themes.desc'),
    buildIn: {},
    type: 'app',
    appIcon: 'mdi-airballoon',
    appAccentColor: '#f50057',
    appType: 'insideView',
}, {
    name: 'files',
    displayName: Lang.string('exts.files.label'),
    description: Lang.string('exts.files.desc'),
    buildIn: {},
    type: 'app',
    appIcon: 'mdi-folder',
    appAccentColor: '#ff9100',
    appType: 'insideView',
}];

// Load internals extensions
const internals = Config.exts && Config.exts.internals;
if (Array.isArray(internals) && internals.length) {
    exts.push(...internals);
}

// Load local build-in extensions
const buildInsPath = path.join(process.env.HOT ? env.appRoot : env.appPath, 'build-in');
const buildInsFile = path.join(buildInsPath, 'extensions.json');
const buildIns = fse.readJsonSync(buildInsFile, {throws: false});
if (buildIns && Array.isArray(buildIns)) {
    buildIns.forEach(extConfig => {
        if (typeof extConfig === 'string') {
            const extPkgPath = path.join(buildInsPath, extConfig, 'package.json');
            const extPkg = fse.readJsonSync(extPkgPath, {throws: false});
            if (extPkg && extPkg.name === extConfig) {
                extConfig = extPkg;
            }
        }
        if (extConfig && (typeof extConfig === 'object')) {
            extConfig.buildIn = {
                localPath: path.join(buildInsPath, extConfig.name)
            };
            exts.push(extConfig);
            if (DEBUG) {
                console.collapse('Extension local', 'greenBg', extConfig.name, 'greenPale');
                console.log('ext', extConfig);
                console.groupEnd();
            }
        }
    });
}

const buildInConfigFile = path.join(buildInsPath, 'config.json');
const buildInConfig = fse.readJsonSync(buildInConfigFile, {throws: false});
if (buildInConfig) {
    updateConfig(buildInConfig);
}

export default exts;
