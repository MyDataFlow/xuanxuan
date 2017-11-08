import StringHelper from '../utils/string-helper';
import loadExtensionModule from './extension-module-loader';
import ExtensionConfig from './extension-config';
import timeSequence from '../utils/time-sequence';
import SearchScore from '../utils/search-score';
import PinYin from '../utils/pinyin';

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
    {name: 'type', equal: 100, prefix: ':'},
    {name: 'author', equal: 100, prefix: '@'},
    {name: 'publisher', equal: 100, prefix: '@'},
    {name: 'homepage', include: 25},
];

export default class Extension {
    static TYPES = TYPES;

    constructor(pkgData, data) {
        const pkg = Object.assign({}, pkgData, pkgData.xxext);
        if (pkg.xxext) {
            delete pkg.xxext;
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

        this._pkg = pkg;

        this._config = new ExtensionConfig(this.name, this.configurations);

        this._data = Object.assign({}, data);

        if (!this.lazy) {
            this.loadModule();
        }
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
    get icon() {return this._pkg.icon;}
    get accentColor() {return this._pkg.accentColor;}
    get description() {return this._pkg.description;}
    get version() {return this._pkg.version;}
    get author() {return this._pkg.author;}
    get publisher() {return this._pkg.publisher;}
    get license() {return this._pkg.license;}
    get homepage() {return this._pkg.homepage;}
    get keywords() {return this._pkg.keywords;}
    get engines() {return this._pkg.engines;}
    get mainFile() {return this._pkg.main;}
    get lazy() {return this._pkg.lazy;}

    get storeData() {
        return {
            data: this._data,
            pkg: this._pkg
        };
    }

    get installTime() {
        return this._data.installTime;
    }

    set installTime(time) {
        this._data.installTime = time;
    }

    get hasModule() {
        return this.mainFile;
    }

    /**
     * 重新载入扩展
     */
    loadModule() {
        if (this.mainFile) {
            const start = new Date().getTime();
            this._module = loadExtensionModule(this.name, this.mainFile);
            this._loadTime = new Date().getTime() - start;

            if (this._module && this._module.onAttach) {
                this._module.onAttach(this);
            }
        }
        return this._module;
    }

    detach() {
        if (this._module && this._module.onDetach) {
            this._module.onDetach(this);
        }
        this._module = null;
    }

    /**
     * 获取上次加载此扩展所花费的时间，单位为毫秒
     */
    get loadTime() {
        return this._loadTime;
    }

    get module() {
        return this._module || this.loadModule();
    }

    getMatchScore(keys) {
        return SearchScore.matchScore(MATCH_SCORE_MAP, this, keys);
    }
}
