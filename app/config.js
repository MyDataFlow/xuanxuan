import Path          from 'path';
import ReadyNotifier from './models/ready-notifier';
import Helper        from './utils/helper';
import User          from './models/user';

/**
 * Defaul config
 * @type {object}
 */
const DEFAULT = {
    version: 4,
    lang: 'zh-cn',
    users: {}
};
const IS_RENDERER = process.type === 'renderer';

/**
 * Config
 */
class Config extends ReadyNotifier {

    /**
     * Config constructor
     * @param  {object} cfg
     * @return {Config}    
     */
    constructor(cfg) {
        super();
        this.$ = cfg ? (cfg.$ || cfg) : {};
    }

    /**
     * Load system config by given application path
     * @return {void}
     */
    load(userDataPath) {
        if(!IS_RENDERER) {
            if(DEBUG) console.warn('Config.load() only avaliable in renderer process.');
            return;
        }

        if(!this.filePath) {
            this.filePath = Path.join(userDataPath, 'config.json');
        }
        Helper.loadJSON(this.filePath, true).then(json => {
            if(json && json.version !== DEFAULT.version) json = null;
            this.$ = {};
            Object.assign(this.$, DEFAULT, json);
            if(DEBUG) {
                console.log('%cLoad config from ' + this.filePath, 'display: inline-block; font-size: 10px; color: #009688; background: #A7FFEB; border: 1px solid #A7FFEB; padding: 1px 5px; border-radius: 2px;');
            }
            this.ready();
        });
    }

    /**
     * Save user
     * 
     * @param {object} user
     * @param {function} callback
     * @returns
     * 
     * @memberOf Config
     */
    save(user, callback) {
        if(!IS_RENDERER) {
            if(DEBUG) console.warn('Config.save(user, callback) only avaliable in main process.');
            return;
        }

        if(typeof user === 'function') {
            callback = user;
            user = null;
        }
        if(user) {
            this.user = user;
        }
        return Helper.writeData(this.filePath, this.$, callback).then(() => {
            if(DEBUG) {
                console.groupCollapsed('%cSAVE USER DATA SUCCESS', 'display: inline-block; font-size: 10px; color: #009688; background: #A7FFEB; border: 1px solid #A7FFEB; padding: 1px 5px; border-radius: 2px;');
                console.log('filename', this.filePath);
                console.log('config', this.$);
                console.groupEnd();
            }
        });
    }

    /**
     * Remove user
     * 
     * @param {string/object} userOrIdentify
     * @param {function}      callback
     * @returns
     * 
     * @memberOf Config
     */
    removeUser(userOrIdentify, callback) {
        let identify = typeof userOrIdentify === 'object' ? userOrIdentify.identify : userOrIdentify;
        if(this.$.users && this.$.users[identify]) {
            delete this.$.users[identify];
            return this.save(callback);
        } else {
            callback && callback();
            return Promise.resolve();
        }
    }

    /**
     * User setter
     */
    set user(user) {
        if(!IS_RENDERER) {
            if(DEBUG) console.warn('Config.set.user only avaliable in main process.');
            return;
        }

        if(!this.$.users) this.$.users = {};
        if(!(user instanceof User)) {
            user = new User(user);
            if(DEBUG) console.warn('Param "user" is not a User object on save config.');
        }
        if(user.identify) {
            this.$.users[user.identify] = Helper.plain(user);
        } else if(DEBUG) {
            console.warn('Cannot set config.user with empty identify.', user);
        }
    }

    /**
     * Get user by identify
     *
     * @param   {string/object} userOrIdentify
     * @returns {User}
     */
    getUser(identify) {
        let newUserValue = null;
        if(typeof identify === 'object') {
            newUserValue = Object.assign({}, Helper.plain(identify));
            if(identify instanceof User) {
                identify = identify.identify;
            } else {
                identify = (new User(identify)).identify;
            }
        }
        let user = null;
        if(identify) {
            user = this.users[identify];
        } else {
            user = this.userList[0];
        }
        return user ? new User(Object.assign(user, newUserValue)) : new User(newUserValue);
    }

    get user() {
        return this.getUser() || new User();
    }

    get users() {
        return this.$.users || {};
    }

    get userList() {
        let users = this.users;
        let list  = Object.keys(users).map(identify => {
            return new User(users[identify]);
        }).sort((x, y) => y.lastLoginTime - x.lastLoginTime);
        return list;
    }

    plain() {
        return Helper.plain(this);
    }
}

export default Config;
