import Md5 from 'md5';
import Platfrom from 'Platform';
import Member from '../models/member';
import UserConfig from './user-config';
import DelayAction from '../../utils/delay-action';
import DateHelper from '../../utils/date-helper';
import Events from '../events';

const PASSWORD_WITH_MD5_FLAG = '%%%PWD_FLAG%%% ';
const EVENT = {
    config_change: 'user.config.change',
    status_change: 'user.status.change',
    reconnect: 'user.reconnect',
};

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
        autoLogin: {type: 'boolean', default: false},
        rememberPassword: {type: 'boolean', default: true},
        signed: {
            type: 'timestamp',
            setter: (time, obj) => {
                const lastSignedTime = obj.signed;
                obj._isFirstSignedToday = time && DateHelper.isToday(time) && (!lastSignedTime || !DateHelper.isSameDay(time, lastSignedTime));
                return time;
            }
        },
    });

    static STATUS = Member.STATUS;

    constructor(data) {
        super(data);

        this.saveUserAction = new DelayAction(() => {
            Platfrom.config.saveUser(this);
        });

        this._status.onChange = (status, oldStatus) => {
            if (this.isEventsEnable) {
                Events.emit(EVENT.status_change, status, oldStatus, this);
            }

            clearTimeout(this.statusChangeCallTimer);
            if (this._status.is(Member.STATUS.logined)) {
                this.$set('lastLoginTime', new Date().getTime());
                this.statusChangeCallTimer = setTimeout(() => {
                    this.status = Member.STATUS.online;
                }, 1000);
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

    get isFirstSignedToday() {
        return !!this._isFirstSignedToday;
    }

    get signed() {
        return this.$get('signed');
    }

    set signed(time) {
        return this.$set('signed', time);
    }

    get config() {
        if (!this._config) {
            this._config = new UserConfig(this.$get('config'));
            this._config.onChange = (change, config) => {
                // Save user to config file
                this.save();

                // Emit user config change event
                if (this.isEventsEnable) {
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

    get isVertified() {
        return this.status >= Member.STATUS.disconnect;
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

    get isLogging() {
        return this._isLogging;
    }

    beginLogin() {
        this._isLogging = true;
    }

    endLogin(result) {
        this._isLogging = false;
        if (result) {
            this.status = Member.STATUS.logined;
        } else if (!this.isDisconnect) {
            this.status = Member.STATUS.unverified;
        }
    }

    get sessionID() {
        return this._sessionID;
    }

    set sessionID(sessionID) {
        this._sessionID = sessionID;
    }

    set server(server) {
        if (server) {
            if (!server.startsWith('https://') && !server.startsWith('http://')) {
                server = `https://${server}`;
            }
            const url = new URL(server);
            if (!url.port) {
                url.port = 11443;
            }
            this.$set('server', url.toString());
            this._server = url;
        }
    }

    get server() {
        if (!this._server) {
            this.server = this.$get('server');
        }
        return this._server;
    }

    get serverUrl() {
        const server = this.server;
        return server && server.toString();
    }

    get ranzhiUrl() {
        if (this._ranzhiUrl === undefined) {
            this._ranzhiUrl = this.$get('ranzhiUrl') || `http://${this.server.hostname}`;
        }
        return this._ranzhiUrl;
    }

    set ranzhiUrl(url) {
        this._ranzhiUrl = url;
    }

    get webServerPort() {
        const server = this.server;
        return server ? server.port : '';
    }

    get serverName() {
        const server = this.server;
        if (server) {
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
        if (this._socketUrl) {
            return this._socketUrl;
        }
        let serverUrl = this.serverUrl;
        if (serverUrl) {
            const url = new URL(serverUrl);
            url.protocol = (this.isVersionSupport('wss') && url.protocol === 'https:') ? 'wss:' : 'ws:';
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
        version = version.toLowerCase();
        if (version[0] === 'v') {
            version = version.substr(1);
        }
        this._serverVersion = version;
    }

    get serverUrlRoot() {
        const serverUrl = this.serverUrl;
        let urlRoot = '';
        if (serverUrl) {
            let url = new URL(serverUrl);
            url.hash = '';
            url.search = '';
            url.pathname = '';
            urlRoot = url.toString();
        }
        if (urlRoot && !urlRoot.endsWith('/')) {
            urlRoot += '/';
        }
        return urlRoot;
    }

    makeServerUrl(path = '') {
        if (path && path.startsWith('/')) {
            path = path.substr(1);
        }
        return this.serverUrlRoot + path;
    }

    get uploadUrl() {
        return this.makeServerUrl('upload');
    }

    get identify() {
        const server = this.server;
        if (!server) {
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

    get uploadFileSize() {
        return this.$get('uploadFileSize');
    }

    set uploadFileSize(uploadFileSize) {
        this.$set('uploadFileSize', uploadFileSize);
    }

    get lastLoginTime() {
        return this.$get('lastLoginTime');
    }

    get autoLogin() {
        return this.$get('autoLogin');
    }

    set autoLogin(autoLogin) {
        this.$set('autoLogin', autoLogin);
    }

    get rememberPassword() {
        return this.$get('rememberPassword');
    }

    set rememberPassword(rememberPassword) {
        this.$set('rememberPassword', rememberPassword);
    }

    get avatar() {
        let avatar = this._avatar;
        if (!avatar) {
            avatar = this.$get('avatar');
            if (avatar) {
                if (!avatar.startsWith('https://') && !avatar.startsWith('http://')) {
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
        if (password && !password.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            password = PASSWORD_WITH_MD5_FLAG + password;
        }
        return password;
    }

    get passwordMD5() {
        let password = this.password;
        if (password.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            password = password.substr(PASSWORD_WITH_MD5_FLAG.length);
        } else {
            password = Md5(password);
        }
        return password;
    }

    set password(newPassword) {
        if (newPassword && !newPassword.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            newPassword = PASSWORD_WITH_MD5_FLAG + Md5(newPassword);
        }
        this.$set('password', newPassword);
    }

    isVersionSupport(name) {
        return this._versionSupport && this._versionSupport[name];
    }

    setVersionSupport(flags) {
        if (flags) {
            if (!this._versionSupport) {
                this._versionSupport = {};
            }
            Object.assign(this._versionSupport, flags);
        }
    }

    static create(user) {
        if (user instanceof User) {
            return user;
        }
        return new User(user);
    }

    static createIdentify(server, account) {
        if (!(server instanceof URL)) {
            if (!server.startsWith('https://') && !server.startsWith('http://')) {
                server = `https://${server}`;
            }
            server = new URL(server);
        }
        if (!server.port) {
            server.port = 11443;
        }
        let pathname = server.pathname;
        if (pathname && pathname.length) {
            if (pathname === '/') {
                pathname = '';
            }
            pathname = pathname.replace(/\//g, '_');
        }
        let hostname = server.host.replace(':', '__');
        return `${account}@${hostname}${pathname}`;
    }
}

export default User;
