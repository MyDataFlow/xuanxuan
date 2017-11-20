import Lang from '../lang';

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

export default exts;
