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
}, {
    name: 'zui',
    displayName: 'ZUI',
    description: '一个基于Bootstrap 深度定制开源前端实践方案',
    type: 'app',
    appIcon: 'Z',
    appAccentColor: '#3280fc',
    appType: 'webView',
    webViewUrl: 'http://zui.sexy'
}, {
    name: 'mzui',
    displayName: 'MZUI',
    description: '为移动端设计，基于 Flex 的 UI 框架。',
    type: 'app',
    appIcon: 'M',
    appAccentColor: '#38b03c',
    appType: 'webView',
    webViewUrl: 'http://zui.sexy/m/'
}, {
    name: 'todos',
    displayName: '待办',
    description: '集成禅道、然之待办。',
    buildIn: {},
    type: 'app',
    appIcon: 'mdi-checkbox-multiple-marked-circle-outline',
    appAccentColor: '#795548',
    appType: 'webView',
    webViewUrl: 'http://zui.sexy/m/'
}, {
    name: 'weather',
    displayName: '天气',
    description: '查看天气预报',
    type: 'app',
    appIcon: 'mdi-weather-partlycloudy',
    appAccentColor: '#03a9f4',
    appType: 'webView',
    webViewUrl: 'http://zui.sexy/m/'
}, {
    name: 'github',
    displayName: 'Github',
    description: '访问 Github 网站',
    type: 'app',
    appIcon: 'mdi-github-circle',
    appAccentColor: '#424242',
    appType: 'webView',
    webViewUrl: 'https://github.com'
}, {
    name: 'xuanxuan-browser',
    displayName: '喧喧网页版',
    description: '直接在你的浏览器上访问喧喧',
    type: 'app',
    appIcon: 'https://raw.githubusercontent.com/easysoft/xuanxuan/master/resources/icon.png',
    appAccentColor: '#eee',
    appType: 'webView',
    webViewUrl: 'https://easysoft.github.io/xuanxuan/1.2.0/'
}];

export default exts;
