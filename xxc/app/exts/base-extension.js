import Path from 'path';
import StringHelper from '../utils/string-helper';
import ExtensionConfig from './extension-config';
import timeSequence from '../utils/time-sequence';
import SearchScore from '../utils/search-score';
import PinYin from '../utils/pinyin';
import Store from '../utils/store';

export const TYPES = {
    app: 'app',
    theme: 'theme',
    plugin: 'plugin',
};

const MATCH_SCORE_MAP = [
    {name: 'name', equal: 100, include: 50},
    {name: 'displayName', equal: 100, include: 50},
    {name: 'pinyinNames', equal: 50, include: 25, array: true},
    {name: 'description', include: 25},
    {name: 'keywords', equal: 50, include: 10, array: true},
    {name: 'type', equal: 100, prefix: '#'},
    {name: 'author', equal: 100, prefix: '@'},
    {name: 'publisher', equal: 100, prefix: '@'},
    {name: 'homepage', include: 25},
];

export default class Extension {
    static TYPES = TYPES;

    constructor(pkgData, data) {
        this.initPkg(pkgData);

        this._config = new ExtensionConfig(this.name, this.configurations);

        this._data = Object.assign({}, data);
    }

    initPkg(pkgData) {
        const pkg = Object.assign({}, pkgData, pkgData.xext);
        if (pkg.xext) {
            delete pkg.xext;
        }

        this._type = TYPES[pkg.type];
        if (!this._type) {
            this._type = TYPES.plugin;
            this.addError('type', `Unknown extension type (${pkg.type}), set to ‘${this._type}’ temporarily.`);
        }
        this._name = pkg.name;
        if (StringHelper.isEmpty(pkg.name) || !(/[A-Za-z0-9_-]+/.test(pkg.name))) {
            this._safeName = `extension-${timeSequence()}`;
            this.addError('name', `Extension name(${pkg.name}) is not valid, use random name '${this._safeName}'.`);
        }

        if (StringHelper.isEmpty(pkg.version)) {
            this.addError('version', 'Extension version not set.');
        }

        this._pkg = pkg;
    }

    addError(name, error) {
        if (!error) {
            error = name;
            name = '_';
        }

        if (!this._errors) {
            this._errors = [];
        }
        if (DEBUG) {
            console.color(`Extension.${this.name}`, 'greenBg', name, 'greenPale', error, 'red');
        }
        this._errors.push({name, error});
    }

    get errors() {
        return this._errors;
    }

    get hasError() {
        return this._errors && this._errors.length;
    }

    get pinyinNames() {
        if (!this._pinyinName) {
            this._pinyinName = PinYin(this.displayName, 'default', false);
        }
        return this._pinyinName;
    }

    get config() {
        return this._config;
    }

    get displayName() {
        return StringHelper.ifEmptyThen(this._pkg.displayName, this._name);
    }

    get type() {
        return this._type;
    }

    get name() {
        return this._safeName || this._name;
    }

    get isTheme() {
        return this._type === TYPES.theme;
    }

    get isPlugin() {
        return this._type === TYPES.plugin;
    }

    get isApp() {
        return this._type === TYPES.app;
    }

    get buildIn() {
        return this._pkg.buildIn;
    }

    get configurations() {
        return this._pkg.configurations || [];
    }

    get pkg() {return this._pkg;}

    get description() {return this._pkg.description;}

    get version() {return this._pkg.version;}

    get author() {return this._pkg.author;}

    get publisher() {return this._pkg.publisher;}

    get license() {return this._pkg.license;}

    get homepage() {return this._pkg.homepage;}

    get keywords() {return this._pkg.keywords;}

    get engines() {return this._pkg.engines;}

    get repository() {return this._pkg.repository;}

    get bugs() {return this._pkg.bugs;}

    get hot() {return !!this._pkg.hot;}

    get entryUrl() {return this._pkg.entryUrl;}

    get entryID() {return this._pkg.entryID;}

    getEntryUrl(referer = '') {
        if (global.ExtsRuntime) {
            const {getEntryVisitUrl} = global.ExtsRuntime;
            if (getEntryVisitUrl) {
                return getEntryVisitUrl(this, referer);
            }
        }
        return Promise.resolve(this.entryUrl);
    }

    get hasServerEntry() {
        return this.entryID || this._pkg.entry;
    }

    get download() {return this._pkg.download;}

    get isRemote() {return this._data.remote;}

    get isRemoteLoaded() {return this._data.remoteLoaded;}

    get md5() {return this._pkg.md5;}

    get user() {return this._data.user;}

    get remoteCachePath() {return this._data.remoteCachePath;}

    get loadRemoteFailed() {return this._data.loadRemoteFailed;}

    get downloadProgress() {
        if (this.isRemoteLoaded) {
            return 1;
        }
        if (!this._data.downloadProgress) {
            return 0;
        }
        return this._data.downloadProgress;
    }

    set downloadProgress(progress) {
        this._data.downloadProgress = progress;
    }

    setLoadRemoteResult(result, error) {
        this._data.loadRemoteFailed = !result;
        this._data.remoteLoaded = !!result;
        if (error) {
            this.addError(error);
        }
    }

    get accentColor() {
        return this._pkg.accentColor || '#f50057';
    }

    get mainFile() {
        if (!this._mainFile) {
            const {buildIn} = this;
            if (buildIn && buildIn.module) {
                this._mainFile = 'BUILD-IN';
            } else if (this.pkg.main) {
                this._mainFile = Path.join(this.localPath, this.pkg.main);
            }
        }
        return this._mainFile;
    }

    get icon() {
        const {icon} = this._pkg;
        if (icon && !this._icon) {
            if (icon.length > 1 && !icon.startsWith('http://') && !icon.startsWith('https://') && !icon.startsWith('mdi-') && !icon.startsWith('icon')) {
                this._icon = Path.join(this.localPath, icon);
            } else {
                this._icon = icon;
            }
        }
        return this._icon || 'mdi-cube';
    }

    get authorName() {
        const {author} = this;
        return author && (author.name || author);
    }

    get storeData() {
        return {
            data: this._data,
            pkg: this._pkg
        };
    }

    get data() {
        return this._data;
    }

    get installTime() {
        return this._data.installTime;
    }

    set installTime(time) {
        this._data.installTime = time;
        this.updateTime = time;
    }

    get disabled() {
        return this._data.disabled === true;
    }

    set disabled(disabled) {
        if (this._data.disabled !== disabled && !this.hot) {
            this._needRestart = true;
        }
        this._data.disabled = disabled;
    }

    get avaliable() {
        return !this.disabled && !this.needRestart && (!this.isRemote || this.isRemoteLoaded);
    }

    get updateTime() {
        return this._data.updateTime;
    }

    set updateTime(time) {
        this._data.updateTime = time;
    }

    get localPath() {
        return this._data.localPath;
    }

    set localPath(localPath) {
        this._data.localPath = localPath;
    }

    get isDev() {
        return this._data.isDev;
    }

    set isDev(flag) {
        this._data.isDev = flag;
    }

    get hasModule() {
        return this.mainFile;
    }

    getConfig(key) {
        if (!this._config) {
            this._config = Store.get(`EXTENSION::${this.id}::config`, {});
        }
        return key === undefined ? this._config : this._config[key];
    }

    setConfig(key, value) {
        const config = this.getConfig();
        if (typeof key === 'object') {
            Object.assign(config, key);
        } else {
            config[key] = value;
        }
        this._config = config;
        Store.set(`EXTENSION::${this.id}::config`, this._config);
    }

    getUserConfig(key, defualtValue) {
        if (Extension.user) {
            return Extension.user.config.getForExtension(this.name, key, defualtValue);
        } else if (DEBUG) {
            console.warn('Cannot set user config for the exteions, because current user is not logined.', this);
        }
    }

    setUserConfig(key, value) {
        if (Extension.user) {
            return Extension.user.config.setForExtension(this.name, key, value);
        } else if (DEBUG) {
            console.warn('Cannot set user config for the exteions, because current user is not logined.', this);
        }
    }

    /**
     * 重新载入扩展
     */
    loadModule() {
        if (this.disabled) {
            if (DEBUG) {
                console.warn('The extension has been disbaled.', this);
            }
            return null;
        }
        const {mainFile} = this;
        if (mainFile) {
            const start = new Date().getTime();

            if (mainFile === 'BUILD-IN') {
                this._module = this.buildIn.module;
            } else {
                try {
                    this._module = __non_webpack_require__(this.mainFile); // eslint-disable-line
                } catch (err) {
                    if (DEBUG) {
                        console.collapse('Extension Attach', 'greenBg', this.name, 'redPale', 'load module error', 'red');
                        console.error('error', err);
                        console.log('extension', this);
                        console.groupEnd();
                    }
                    this._module = {};
                }
            }

            if (this._module) {
                this.callModuleMethod('onAttach', this);
            }

            this._loadTime = new Date().getTime() - start;
            this._loaded = true;

            if (DEBUG) {
                console.collapse('Extension Attach', 'greenBg', this.name, 'greenPale', `spend time: ${this._loadTime}ms`, 'orange');
                console.trace('extension', this);
                console.log('module', this._module);
                console.groupEnd();
            }
        }
        return this._module;
    }

    get isModuleLoaded() {
        return this._loaded;
    }

    get needRestart() {
        return this._needRestart || (!this.disabled && this.hasModule && !this._loaded && !this.hot);
    }

    attach() {
        if (!this.disabled && !this._loaded && this.hasModule) {
            this.loadModule();
            return true;
        }
    }

    hotAttach() {
        if (this.hot && this.attach()) {
            this.callModuleMethod('onReady', this);
            return true;
        }
        return false;
    }

    detach() {
        if (this._module && this._loaded) {
            this.callModuleMethod('onDetach', this);
        }
        const {mainFile} = this;
        if (mainFile && mainFile !== 'BUILD-IN') {
            delete __non_webpack_require__.cache[mainFile]; // eslint-disable-line
        }
        this._module = null;
        this._loaded = false;
        if (DEBUG) {
            console.collapse('Extension Detach', 'greenBg', this.name, 'greenPale');
            console.trace('extension', this);
            console.groupEnd();
        }
    }

    get hasReplaceViews() {
        if (this.disabled) {
            if (DEBUG) {
                console.warn('The extension has been disbaled.', this);
            }
            return false;
        }
        const extModule = this.module;
        return extModule && extModule.replaceViews;
    }

    get replaceViews() {
        if (this.disabled) {
            if (DEBUG) {
                console.warn('The extension has been disbaled.', this);
            }
            return null;
        }
        const extModule = this.module;
        return extModule && extModule.replaceViews;
    }

    /**
     * 获取上次加载此扩展所花费的时间，单位为毫秒
     */
    get loadTime() {
        return this._loadTime;
    }

    get module() {
        if (this.disabled) {
            if (DEBUG) {
                console.warn('The extension has been disbaled.', this);
            }
            return false;
        }
        return this._module || this.loadModule();
    }

    callModuleMethod(methodName, ...params) {
        if (this.disabled) {
            if (DEBUG) {
                console.warn('The extension has been disbaled.', this);
            }
            return false;
        }
        const extModule = this._module;
        if (extModule && extModule[methodName]) {
            try {
                return extModule[methodName].apply(this, params);
            } catch (err) {
                if (DEBUG) {
                    console.collapse('Extension Attach', 'greenBg', this.name, 'redPale', `call module method '${methodName}' error`, 'red');
                    console.log('methodName', methodName);
                    console.log('params', params);
                    console.log('error', err);
                    console.log('extension', this);
                    console.groupEnd();
                }
            }
        }
    }

    get commands() {
        if (this.disabled) {
            if (DEBUG) {
                console.warn('The extension has been disbaled.', this);
            }
            return null;
        }
        const extModule = this.module;
        return extModule && extModule.commands;
    }

    getCommand(commandName) {
        const {commands} = this;
        let command = commands && commands[commandName];
        if (command) {
            if (typeof command === 'function') {
                command = {func: command, name: commandName};
            }
        }
        command.name = `extension/${commandName}`;
        return command;
    }

    getUrlInspector(url, type = 'inspect') {
        if (this.disabled) {
            if (DEBUG) {
                console.warn('The extension has been disbaled.', this);
            }
            return null;
        }
        const extModule = this.module;
        let urlInspectors = extModule && extModule.urlInspectors;
        if (urlInspectors) {
            const urlObj = new URL(url);
            if (!Array.isArray(urlInspectors)) {
                urlInspectors = [urlInspectors];
            }
            const urlInspector = urlInspectors.find(x => {
                if (!x[type]) {
                    return false;
                }
                if (typeof x.test === 'function') {
                    return x.test(url, urlObj);
                }
                if (Array.isArray(x.test)) {
                    x.test = new Set(x.test);
                } else if (typeof x.test === 'string') {
                    x.test = new RegExp(x.test, 'i');
                }
                if (x.test instanceof Set) {
                    return x.test.has(urlObj.host);
                }
                return x.test.test(url);
            });
            if (urlInspector && !urlInspector.provider) {
                urlInspector.provider = {
                    icon: this.icon,
                    name: this.name,
                    label: this.displayName,
                    url: `!showExtensionDialog/${this.name}`
                };
            }
            return urlInspector;
        }
        return null;
    }

    getUrlOpener(url) {
        return this.getUrlInspector(url, 'open');
    }

    formatContextMenuItem(menuItem, urlFormatObject) {
        urlFormatObject = Object.assign({}, urlFormatObject, {EXTENSION: `extension/${this.name}`});
        menuItem = Object.assign({}, menuItem);
        if (menuItem.url) {
            menuItem.url = StringHelper.format(menuItem.url, urlFormatObject);
        }
        menuItem.label = `${this.displayName}: ${menuItem.label || menuItem.url}`;
        if (!menuItem.icon) {
            menuItem.icon = this.icon;
        }
        return menuItem;
    }

    getContextMenuCreators() {
        const creators = this._pkg.contextMenuCreators || [];
        const extModule = this.module;
        if (extModule && extModule.contextMenuCreators) {
            creators.push(...extModule.contextMenuCreators);
        }
        return creators;
    }

    getMatchScore(keys) {
        return SearchScore.matchScore(MATCH_SCORE_MAP, this, keys);
    }
}
