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

export default exts;
