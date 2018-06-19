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
        if (StringHelper.isEmpty(pkg.name) || !(/[A-Za-z0-9\_-]+/.test(pkg.name))) {
            this._safeName = `extension-${timeSequence()}`;
            this.addError('name', `Extension name(${pkg.name}) is not valid, use random name '${this._safeName}'.`);
        }

        if (StringHelper.isEmpty(pkg.version)) {
            this.addError('version', 'Extension version not set.');
        }

        this._pkg = pkg;

        this._config = new ExtensionConfig(this.name, this.configurations);

        this._data = Object.assign({}, data);
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

    get accentColor() {
        return this._pkg.accentColor || '#f50057';
    }

    get mainFile() {
        if (!this._mainFile) {
            const buildIn = this.buildIn;
            if (buildIn && buildIn.module) {
                this._mainFile = 'BUILD-IN';
            } else if (this.pkg.main) {
                this._mainFile = Path.join(this.localPath, this.pkg.main);
            }
        }
        return this._mainFile;
    }

    get icon() {
        const icon = this._pkg.icon;
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
        const author = this.author;
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
        return !this.disabled && !this.needRestart;
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

    getConfigStoreKey(forUser = false) {
        return forUser ? `EXTENSION::${this.id}::USER::${Extension.user.identify}::config` : `EXTENSION::${this.id}::config`;
    }

    getConfig(key, forUser = false) {
        if (!this._config) {
            this._config = Store.get(this.getConfigStoreKey(forUser), {});
        }
        return key === undefined ? this._config : this._config[key];
    }

    setConfig(key, value, forUser = false) {
        const config = this.getConfig();
        if (typeof key === 'object') {
            Object.assign(config, key);
        } else {
            config[key] = value;
        }
        this._config = config;
        Store.set(this.getConfigStoreKey(forUser), this._config);
    }

    getUserConfig(key) {
        if (Extension.user) {
            return this.getConfig(key, true);
        } else if (DEBUG) {
            console.warn('Cannot set user config for the exteions, because current user is not logined.', this);
        }
    }

    setUserConfig(key, value) {
        if (Extension.user) {
            return this.setUserConfig(key, value, true);
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
        const mainFile = this.mainFile;
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
                }
            }

            this.callModuleMethod('onAttach', this);

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
        return this._needRestart || (!this.disabled && this.hasModule && !this._loaded);
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
        this.callModuleMethod('onDetach', this);
        const mainFile = this.mainFile;
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
        const extModule = this.module;
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
        const commands = this.commands;
        let command = commands && commands[commandName];
        if (command) {
            if (typeof command === 'function') {
                command = {func: command, name: commandName};
            }
        }
        command.name = `extension/${commandName}`;
        return command;
    }

    getChatMessageMenu(urlFormatObject) {
        let menu = [];
        const pkgMenu = this._pkg.chatMessageMenu;
        if (pkgMenu) {
            menu.push(...pkgMenu);
        }

        const extModule = this.module;
        let moduleMenu = extModule && extModule.chatMessageMenu;
        if (moduleMenu) {
            if (typeof moduleMenu === 'function') {
                moduleMenu = moduleMenu(this);
            }
            if (moduleMenu) {
                menu.push(...moduleMenu);
            }
        }

        if (menu && menu.length) {
            urlFormatObject = Object.assign({}, urlFormatObject, {EXTENSION: `extension/${this.name}`});
            menu = menu.map(menuItem => {
                menuItem = Object.assign({}, menuItem);
                if (menuItem.url) {
                    menuItem.url = StringHelper.format(menuItem.url, urlFormatObject);
                }
                menuItem.label = `${this.displayName}: ${menuItem.label || menuItem.url}`;
                if (!menuItem.icon) {
                    menuItem.icon = this.icon;
                }
                return menuItem;
            });
        }
        return menu;
    }

    getMatchScore(keys) {
        return SearchScore.matchScore(MATCH_SCORE_MAP, this, keys);
    }
}
