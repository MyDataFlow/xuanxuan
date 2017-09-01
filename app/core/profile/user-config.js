import DEFAULT from './user-default-config';
import DelayAction from '../../utils/delay-action';

class UserConfig {

    constructor(config) {
        if(config.version !== DEFAULT.version) {
            config = null;
        }
        this.$ = Object.assign({}, DEFAULT, config);

        this.changeAction = new DelayAction(() => {
            this.onChange(this.lastChange, this);
            this.lastChange = null;
        });
    }

    plain() {
        return Object.assign({}, this.$);
    }

    exportCloud() {
        let config = {};
        Object.keys(this.$).forEach(key => {
            if(key.indexOf('local.') !== 0) {
                config[key] = this.$[key];
            }
        });
        return config;
    }

    makeChange(change) {
        this.lastChange = Object.assign({}, this.lastChange, change);

        if(typeof this.onChange === 'function') {
            this.changeAction.do();
        }
        this.$.lastChangeTime = new Date().getTime();
    }

    get(key, defaultValue) {
        if(this.$) {
            let val = this.$[key];
            if(val !== undefined) return val;
        }
        if(defaultValue === undefined) {
            defaultValue = DEFAULT[key];
        }
        return defaultValue;
    }

    set(keyOrObj, value) {
        if(typeof keyOrObj === 'object') {
            Object.assign(this.$, keyOrObj);
            this.makeChange(keyOrObj);
        } else {
            this.$[key] = value;
            this.makeChange({[key]: value});
        }
    }

    reset(newConfig) {
        this.$ = Object.assign({}, newConfig, DEFAULT);
        this.makeChange(this.$);
    }

    get autoReconnect() {
        return this.get('user.autoReconnect');
    }

    set autoReconnect(flag) {
        return this.set('user.autoReconnect', flag);
    }

    get lastSaveTime() {
        return this.get('lastSaveTime');
    }

    set lastSaveTime(time) {
        if(time instanceof Date) {
            time = time.getTime();
        }
        return this.set('lastSaveTime', time);
    }
}

export default UserConfig;
