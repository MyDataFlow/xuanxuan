import Member from '../models/member';
import UserConfig from '../user-config';
import Platfrom from 'Platform';
import DelayAction from '../utils/delay-action';
import Events from './events';

const PASSWORD_WITH_MD5_FLAG = '%%%PWD_FLAG%%% ';
const EVENT = {
    config_change: 'user.config.change',
    status_change: 'user.status.change',
    reconnect: 'user.reconnect',
};
const RECONNECT_WAIT_TIME = 10000;

class User extends Member {

    static EVENT = EVENT;
    static SCHEMA = Member.SCHEMA.extend({
        lastLoginTime: {type: 'timestamp'},
        config: {type: 'object', defaultValue: {}},
        password: {type: 'string'},
        token: {type: 'string'},
        cipherIV: {type: 'string'},
        server: {type: 'string'},
        avatar: {type: 'string'},
        serverVersion: {type: 'string'},
        uploadFileSize: {type: 'int'},
    });
    static STATUS = Member.STATUS;

    constructor(data) {
        super(data);

        this.saveUserAction = new DelayAction(() => {
            Platfrom.config.saveUser(this);
        });

        this._status.onChnage = (status, oldStatus) => {
            if(!this.markDestory) {
                Events.emit(EVENT.status_change, status, oldStatus, this);
            }

            clearTimeout(this.statusChangeCallTimer);
            if(this._status.is(Member.STATUS.logined)) {
                this.$set('lastLoginTime', new Date().getTime());
                if(oldStatus === Member.status.reconnecting) {
                    this._status.change(Member.STATUS.online);
                } else {
                    this.statusChangeCallTimer = setTimeout(() => {
                        this._status.change(Member.STATUS.online);
                    }, 1000);
                }
                this.reconnectTimes = 0;
            } else if(
                (
                    this._status.is(Member.STATUS.disconnect) ||
                    (this._status.is(Member.status.loginFailed) && oldStatus === Member.status.reconnecting)
                ) && this.config.autoReconnect
            ) {
                this.reconnect();
            }
        };
    }

    get schema() {
        return User.SCHEMA;
    }

    destroy() {
        this.markDestory = true;
    }

    plain() {
        return Object.assign({}, this.$, {
            config: this.config.plain()
        });
    }

    save() {
        this.saveUserAction.do();
    }

    get config() {
        if(!this._config) {
            this._config = new UserConfig(this.$get('config'));
            this._config.onChnage = (change, config) => {
                // Save user to config file
                this.save();

                // Emit user config change event
                if(!this.markDestory) {
                    Events.emit(EVENT.config_change, change, config, this);
                }
            };
        }
        return this._config;
    }

    get isDisconnect() {
        return this._status.is(Member.STATUS.disconnect);
    }

    get isUnverified() {
        return this.status <= Member.STATUS.unverified;
    }

    get isLogging() {
        return this._status.is(Member.STATUS.logining) || this._status.is(Member.STATUS.reconnecting);
    }

    get isWaitReconnect() {
        return this._status.is(Member.STATUS.waitReconnect);
    }

    get isLogined() {
        return this.status >= Member.STATUS.logined;
    }

    markDisconnect() {
        this._status.change(Member.STATUS.disconnect);
    }

    markUnverified() {
        this._status.change(Member.STATUS.unverified);
    }

    beginLogin() {
        const reconnect = this.isWaitReconnect;
        this._status.change(reconnect ? Member.STATUS.reconnecting : Member.STATUS.logining);
    }

    endLogin(result) {
        this._status.change(result ? Member.STATUS.logined : Member.STATUS.loginFailed);
    }

    reconnect(delay = 'auto') {
        if(this.reconnectTimes === undefined) {
            this.reconnectTimes = 0;
        }
        if(delay === 'auto') {
            delay = this.reconnectTimes * RECONNECT_WAIT_TIME;
        }
        if(!delay) {
            delay = 0;
        }
        const clearDelayTimer = () => {
            if(this.delayReconnectTimer) {
                clearTimeout(this.delayReconnectTimer);
                this.delayReconnectTimer = null;
            }
            if(this.waitReconnectTimer) {
                clearInterval(this.waitReconnectTimer);
                this.waitReconnectTimer = null;
            }
        };
        const requestReconnect = () => {
            clearDelayTimer();
            if(this._status.is(Member.STATUS.waitReconnect)) {
                this.reconnectTimes++;
                Events.emit(EVENT.reconnect, 0, this);
            }
        };

        this._status.change(Member.STATUS.waitReconnect);
        if(delay) {
            clearDelayTimer();
            this.waitReconnectTime = new Date().getTime();
            this.delayReconnectTimer = setTimeout(requestReconnect, delay);
            if(delay > 2) {
                this.waitReconnectTimer = setInterval(() => {
                    const now = new Date().getTime();
                    const time = Math.max(0, this.waitReconnectTime + delay - now);
                    Events.emit(EVENT.reconnect, time, this);
                }, 1000);
            }
        } else {
            requestReconnect();
        }
    }

    set server(server) {
        if(!server.startsWith('https://') && !server.startsWith('http://')) {
            server = 'https://' + server;
        }
        this._server = new URL(server);
        this.$set('server', url.toString());
    }

    get server() {
        if(!this._server) {
            this._server = new URL(this.$get('server'));
        }
        return this._server;
    }

    get serverUrl() {
        return this.server && this.server.toString();
    }

    get webServerPort() {
        let server = this.server;
        return server ? server.port : '';
    }

    get serverName() {
        let server = this.server;
        if(server) {
            return server.username ? server.username : (server.pathname ? server.pathname.substr(1) : '');
        }
        return '';
    }

    get webServerInfoUrl() {
        let server = this.server;
        return server ? `${server.origin}/serverInfo` : '';
    }

    get socketPort() {
        return this._socketPort || '';
    }

    set socketPort(port) {
        this._socketPort = port;
    }

    get socketUrl() {
        if(this._socketUrl) {
            return this._socketUrl;
        }
        let serverUrl = this.serverUrl;
        if(server) {
            let url = new URL(serverUrl);
            url.protocol = 'ws:';
            url.pathname = '/ws';
            url.port = this.socketPort;
            return url.toString();
        }
        return '';
    }

    set socketUrl(url) {
        this._socketUrl = url;
    }

    get serverVersion() {
        return this._serverVersion;
    }

    set serverVersion(version) {
        if(version[0] === 'v') {
            version = version.substr(1);
        }
        this._serverVersion = version;
    }

    get serverUrlRoot() {
        const serverUrl = this.serverUrl;
        let urlRoot = '';
        if(serverUrl) {
            let url = new URL(serverUrl);
            url.hash = '';
            url.search = '';
            url.pathname = '';
            urlRoot = url.toString();
        }
        if(urlRoot && !urlRoot.endsWith('/')) {
            urlRoot += '/';
        }
        return urlRoot
    }

    makeServerUrl(path = '') {
        if(path && path.startsWith('/')) {
            path = path.substr(1);
        }
        return this.serverUrlRoot + path;
    }

    get identify() {
        let serverUrl = this.serverUrl;
        if(!serverUrl) {
            return '';
        }
        let pathname = url.pathname;
        if(pathname && pathname.length) {
            if(pathname === '/') {
                pathname = '';
            }
            pathname = pathname.replace(/\//g, '_');
        }
        let hostname = url.host.replace(':', '__');
        return `${this.account}@${hostname}${pathname}`;
    }

    get token() {
        return this.$get('token');
    }

    set token(token) {
        this.$set('token', token);
    }

    get cipherIV() {
        return this.$get('cipherIV');
    }

    set cipherIV(cipherIV) {
        this.$set('cipherIV', cipherIV);
    }

    get serverVersion() {
        return this.$get('serverVersion');
    }

    set serverVersion(serverVersion) {
        this.$set('serverVersion', serverVersion);
    }

    get uploadFileSize() {
        return this.$get('uploadFileSize');
    }

    set uploadFileSize(uploadFileSize) {
        this.$set('uploadFileSize', uploadFileSize);
    }

    get lastLoginTime() {
        return this.$get('lastLoginTime');
    }

    get avatar() {
        let avatar = this._avatar;
        if(!avatar) {
            avatar = this.$get('avatar');
            if(avatar) {
                if(!avatar.startsWith('https://') && !avatar.startsWith('http://')) {
                    avatar = this.serverUrlRoot + avatar;
                }
            }
        }
        return avatar;
    }

    set avatar(newAvatar) {
        this._avatar = null;
        this.$set('avatar', newAvatar);
    }

    get isNeverLogined() {
        return !this.lastLoginTime;
    }

    get password() {
        return this.$get('password');
    }

    get passwordMD5WithFlag() {
        let password = this.password;
        if(password && !password.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            password = PASSWORD_WITH_MD5_FLAG + password;
        }
        return password;
    }

    get passwordMD5() {
        let password = this.password;
        if(password.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            password = password.substr(PASSWORD_WITH_MD5_FLAG.length);
        }
        return password;
    }

    set password(newPassword) {
        if(newPassword && !newPassword.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            newPassword = PASSWORD_WITH_MD5_FLAG + Md5(newPassword);
        }
        this.$set('password', newPassword);
    }
}

export default User;
