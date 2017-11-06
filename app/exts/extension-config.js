import Store from '../utils/store';

const KEY_EXT_PREFIX = 'EXTENSION::';

export default class ExtensionConfig {
    constructor(extension) {
        const {name, configurations} = extension;
        const configMap = {};
        if (configurations) {
            configurations.forEach(cfg => {
                configMap[cfg.name] = cfg;
            });
        }
        const storeName = `${KEY_EXT_PREFIX}${name}`;
        const configData = Store.get(this._storeName, {});

        this._name = name;
        this._configurations = configurations;
        this._storeName = storeName;
        this._map = configMap;
        this.$ = configData;
    }

    get(key, defaultValue) {
        const value = this.$[key];
        if (value === undefined) {
            if (defaultValue === undefined) {
                defaultValue = this.map[key].defaultValue;
            }
            return defaultValue;
        }
        return value;
    }

    set(key, value) {
        const mapItem = this.map[key];
        if (mapItem && mapItem.matchReg && !new RegExp(mapItem.matchReg).test(value)) {
            throw new Error(`The value '${value}' for the key '${key}' is not valid, must match the regexp '${mapItem.matchReg}'.`);
        }
        this.$[key] = value;
        Store.set(this._storeName, this.$);
        return this;
    }
}
