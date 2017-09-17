import Member from '../models/member';
import UserConfig from './user-config';
import Platfrom from 'Platform';
import DelayAction from '../../utils/delay-action';
import Events from '../events';
import Md5 from 'md5';

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
        serverVersion: {type: 'string'},
        uploadFileSize: {type: 'int'},
    });
    static STATUS = Member.STATUS;

    constructor(data) {
        super(data);

        this.saveUserAction = new DelayAction(() => {
            Platfrom.config.saveUser(this);
        });

        this._status.onChange = (status, oldStatus) => {
            if(this.isEventsEnable) {
                Events.emit(EVENT.status_change, status, oldStatus, this);
            }

            clearTimeout(this.statusChangeCallTimer);
            if(this._status.is(Member.STATUS.logined)) {
                this.$set('lastLoginTime', new Date().getTime());
                if(oldStatus === Member.STATUS.reconnecting) {
                    this.status = Member.STATUS.online;
                } else {
                    this.statusChangeCallTimer = setTimeout(() => {
                        this.status = Member.STATUS.online;
                    }, 1000);
                }
                this.reconnectTimes = 0;
            } else if(
                (
                    this._status.is(Member.STATUS.disconnect) ||
                    (this._status.is(Member.STATUS.loginFailed) && oldStatus === Member.STATUS.reconnecting)
                ) && this.config.autoReconnect
            ) {
                this.reconnect();
            }
        };
    }

    get schema() {
        return User.SCHEMA;
    }

    get isEventsEnable() {
        return this.eventsEnable;
    }

    enableEvents() {
        this.eventsEnable = true;
    }

    destroy() {
        this.eventsEnable = false;
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
            this._config.onChange = (change, config) => {
                // Save user to config file
                this.save();

                // Emit user config change event
                if(this.isEventsEnable) {
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
        this.status = Member.STATUS.disconnect;
    }

    markUnverified() {
        this.status = Member.STATUS.unverified;
    }

    beginLogin() {
        const reconnect = this.isWaitReconnect;
        this.status = reconnect ? Member.STATUS.reconnecting : Member.STATUS.logining;
    }

    endLogin(result) {
        this.status = result ? Member.STATUS.logined : Member.STATUS.loginFailed;
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

        this.status = Member.STATUS.waitReconnect;
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
        const url = new URL(server);
        if(!url.port) {
            url.port = 11443;
        }
        this.$set('server', url.toString());
        this._server = url;
    }

    get server() {
        if(!this._server) {
            this.server = this.$get('server');
        }
        return this._server;
    }

    get serverUrl() {
        const server = this.server;
        return server && server.toString();
    }

    get webServerPort() {
        const server = this.server;
        return server ? server.port : '';
    }

    get serverName() {
        const server = this.server;
        if(server) {
            return server.username ? server.username : (server.pathname ? server.pathname.substr(1) : '');
        }
        return '';
    }

    get webServerInfoUrl() {
        const server = this.server;
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
        if(serverUrl) {
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
        let server = this.server;
        if(!server) {
            return '';
        }
        return User.createIdentify(server, this.account);
    }

    get token() {
        return this.$get('token');
    }

    set token(token) {
        this.$set('token', token);
    }

    get cipherIV() {
        return this.token.substr(0, 16);
        // let cipherIV = this.$get('cipherIV');
        // if(!cipherIV) {
        //     cipherIV = this.token.substr(0, 16);
        // }
        // return cipherIV;
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
        } else {
            password = Md5(password)
        }
        return password;
    }

    set password(newPassword) {
        if(newPassword && !newPassword.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            newPassword = PASSWORD_WITH_MD5_FLAG + Md5(newPassword);
        }
        this.$set('password', newPassword);
    }

    static create(user) {
        if(user instanceof User) {
            return user;
        }
        return new User(user);
    }

    static createIdentify(server, account) {
        if(!(server instanceof URL)) {
            if(!server.startsWith('https://') && !server.startsWith('http://')) {
                server = `https://${server}`;
            }
            server = new URL(server);
        }
        if(!server.port) {
            server.port = 11443;
        }
        let pathname = server.pathname;
        if(pathname && pathname.length) {
            if(pathname === '/') {
                pathname = '';
            }
            pathname = pathname.replace(/\//g, '_');
        }
        let hostname = server.host.replace(':', '__');
        return `${account}@${hostname}${pathname}`;
    }
}

export default User;
