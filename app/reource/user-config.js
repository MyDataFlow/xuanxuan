import DEFAULT from './user-default-config';
import DelayAction from '../utils/delay-action';

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

    resetDefault() {
        this.$ = Object.assign({}, DEFAULT);
        this.makeChange(this.$);
    }
}

export default UserConfig;
