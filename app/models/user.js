import Md5      from 'md5';
import UUID     from 'uuid';
import Url      from 'url';
import Path     from 'path';
import Events   from '../event-center';
import Member, {
    USER_STATUS
}               from './member';
import R        from 'Resource';
import DEFAULT  from './user-default-config';


const PASSWORD_WITH_MD5_FLAG = '%%%PWD_FLAG%%% ';
const PASSWORD_WITH_MD5_FLAG_LENGTH = 15;

/**
 * The user class
 */
class User extends Member {

    constructor(user) {
        super(user);

        this.config;
        this.zentaoConfig;

        this.$['status'] = USER_STATUS.unverified;
        if(user && user.password) {
            this.setPassword(user.password);
        }

        if(this.config && this.config.version !== DEFAULT.version) {
            this.config = null;
        }
        this.config = Object.assign({}, DEFAULT, this.config);
    }

    /**
     * Initial function to generate id attribute
     * @return {string}
     */
    _initValuesConverter() {
        return {
            lastLoginTime: "timestamp"
        };
    }

    /**
     * Set server
     * @param  {string} server like 'https://x.com:11443/ranzhi1'
     * @return {void}
     */
    set server(server) {
        if(server.indexOf('#v') > -1) {
            this.serverVersion = server.split('#')[1].substr(1);
        } else {
            this.serverVersion = '';
        }
        if(server.indexOf('https://') !== 0 && server.indexOf('http://') !== 0) {
            server = (this.isClassicApi ? 'http://' : 'https://') + server;
        }
        let url = new URL(server);
        this._server = url.toString();
        this.$.serverUrl = null;
    }

    /**
     * Check is old version
     * @return {Boolean}
     */
    get isClassicApi() {
        return this.serverVersion === '1.0';
    }

    /**
     * Check is new api
     * @return {Boolean}
     */
    get isNewApi() {
        return !this.isClassicApi;
    }

    /**
     * Get server
     * @return {string}
     */
    get server() {
        return this._server;
    }

    /**
     * Get server url
     * @return {URL}
     */
    get serverUrl() {
        if(!this._server) {
            return null;
        }
        if(!this.$.serverUrl) {
            this.$.serverUrl = new URL(this._server);
            if(!this.$.serverUrl.port) {
                this.$.serverUrl.port = 11443;
            }
        }
        return this.$.serverUrl;
    }

    /**
     * Get web server port
     * @return {string}
     */
    get webServerPort() {
        const url = this.serverUrl;
        return url ? url.port : '';
    }

    /**
     * Get remote server name from url
     * @return {string}
     */
    get serverName() {
        const url = this.serverUrl;
        if(url) {
            return url.username ? url.username : (url.pathname ? url.pathname.substr(1) : '');
        }
        return '';
    }

    /**
     * Get web server info url
     * @return {string}
     */
    get webServerInfoUrl() {
        const url = this.serverUrl;
        return url ? (url.origin + '/serverInfo') : '';
    }

    /**
     * Get socket port
     * @return {string}
     */
    get socketPort() {
        return this._socketPort || '';
    }

    /**
     * Set socket port
     * @param  {string} port
     * @return {void}
     */
    set socketPort(port) {
        this._socketPort = port;
    }

    /**
     * Get socket serverUrl
     * @return {string}
     */
    get socketUrl() {
        if(this._socketUrl) {
            return this._socketUrl;
        }
        let url = this.serverUrl;
        if(url) {
            url = new URL(url.toString());
            url.protocol = 'ws:';
            url.pathname = '/ws';
            url.port = this.socketPort;
            return url.toString();
        }
        return '';
    }

    /**
     * Set socket url
     * @param  {string} url
     * @return {void}
     */
    set socketUrl(url) {
        this._socketUrl = url;
    }

    /**
     * Get server version
     * @return {string}
     */
    get serverVersion() {
        return this._serverVersion;
    }

    /**
     * Set server version
     * @param  {string} version
     * @return {void}
     */
    set serverVersion(version) {
        if(version[0] === 'v') {
            version = version.substr(1);
        }
        this._serverVersion = version;
    }

    /**
     * Get server address root
     * @return {string}
     */
    get serverUrlRoot() {
        let url = this.serverUrl;
        let urlStr = '';
        if(url) {
            url = new URL(url.toString());
            url.hash = '';
            url.search = '';
            if(this.isNewApi) {
                url.pathname = '/';
            }
            urlStr = url.toString();
        }
        if(urlStr && urlStr[urlStr.length - 1] !== '/') {
            urlStr += '/';
        }
        return urlStr;
    }

    /**
     * Make server url
     * @param  {string} path
     * @return {string}
     */
    makeServerUrl(path) {
        if(path && path[path.length - 1] === '/') {
            path = path.substr(0, path.length - 1);
        }
        return this.serverUrlRoot + path;
    }

    /**
     * Get port
     * @return {number}
     */
    get classicApiPort() {
        return this._port || '8080';
    }

    /**
     * Get host
     * @return {string}
     */
    get classicApiHost() {
        return this._host || '127.0.0.1';
    }

    /**
     * Set classic API host
     * @param  {String} host
     * @return {Void}
     */
    set classicApiHost(host) {
        this._host = host;
    }

    /**
     * Set classic API port
     * @param  {String} port
     * @return {Void}
     */
    set classicApiPort(port) {
        this._port = port;
    }

    /**
     * Get user identify string
     * @return {string}
     */
    get identify() {
        const url = this.serverUrl;
        if(!url) return '';
        let pathname = url.pathname;
        if(pathname === '/') pathname = '';
        if(pathname && pathname.length) pathname = pathname.replace(/\//g, '_');
        return this.account + '@' + url.host.replace(':', '__') + pathname;
    }

    /**
     * Get server token
     * @return {string}
     */
    get token() {
        return this._token;
    }

    /**
     * Get 
     * @return {string}
     */
    get cipherIV() {
        return this._token.substr(0, 16);
    }

    /**
     * Set server token
     * @param  {string} token
     * @return {void}
     */
    set token(token) {
        this._token = token;
    }

    /**
     * Set user config
     */
    setConfig(objOrKey, value) {
        if(!this.config) this.config = {};
        if(typeof objOrKey === 'object') {
            Object.assign(this.config, objOrKey);
        } else {
            this.config[objOrKey] = value;
        }
        this.config.lastSaveTime = new Date().getTime();
        if(this.listenStatus) {
            Events.emit(R.event.user_config_change, this, objOrKey, value);
        }
    }

    /**
     * Reset config
     * @param  {object} config
     * @return {void}
     */
    resetConfig(config) {
        const oldConfig = this.config;
        Object.assign(this.config, config);
        this.config.lastSaveTime = new Date().getTime();
        if(this.listenStatus) {
            Events.emit(R.event.user_config_reset, this, config, oldConfig);
        }
    }

    /**
     * Get user config
     * @param {string} key
     * @param {any}    defaultValue optional
     */
    getConfig(key, defaultValue) {
        if(this.config) {
            let val = this.config[key];
            if(val !== undefined) return val;
        }
        if(defaultValue === undefined) {
            defaultValue = DEFAULT[key];
        }
        return defaultValue;
    }

    /**
     * Get zentao config object
     * @return {ZentaoConfig}
     */
    get zentaoConfig() {
        return this.$.zentaoConfig;
    }

    /**
     * Set zentao config object
     * @param  {ZentaoCofnig} zentaoConfig
     * @return {void}
     */
    set zentaoConfig(zentaoConfig) {
        this.$.zentaoConfig = zentaoConfig;
        if(zentaoConfig.port) {
            this._port = zentaoConfig.port;
        }
        if(zentaoConfig.ip) {
            this._host = zentaoConfig.ip;
        }
    }

    /**
     * Get user images path
     * @return {string}
     */
    get imagesPath() {
        return Path.join(this.dataPath, 'images');
    }

    /**
     * Get user files path
     * @return {string}
     */
    get filesPath() {
        return Path.join(this.dataPath, 'files');
    }

    /**
     * Get user temp files path
     * @return {string}
     */
    get tempPath() {
        return Path.join(this.dataPath, 'temp');
    }

    /**
     * Get user data path
     * @return {string}
     */
    get dataPath() {
        return this.$.dataPath;
    }

    /**
     * Set user data path
     * @param  {string} dataPath
     */
    set dataPath(dataPath) {
        this.$.dataPath = dataPath;
    }

    /**
     * Make file name
     * @param  {string} filenameOrType
     * @return {string}
     */
    makeFileName(filenameOrType) {
        let ext;
        let idx = filenameOrType.lastIndexOf('/');
        if(idx > -1) {
            ext = '.' + filenameOrType.substr(idx + 1);
        } else if(filenameOrType.length < 6 && filenameOrType[0] === '.') {
            ext = filenameOrType;
        }
        return ext ? (UUID.v4() + ext) : filenameOrType ? filenameOrType : UUID.v4();
    }

    /**
     * Make file path with user data path
     * @param  {string} filename
     * @param  {string} type
     * @return {string}
     */
    makeFilePath(filename, type = 'temp') {
        return Path.join(this.dataPath, type, this.makeFileName(filename));
    }

    /**
     * Check the useris never logined
     * @return {Boolean}
     */
    get isNeverLogined() {
        return !this.lastLoginTime;
    }

    /**
     * Get password md5 string with flag
     * @return {String}
     */
    get passwordMD5WithFlag() {
        if(this.password && !this.password.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            return PASSWORD_WITH_MD5_FLAG + this.password;
        }
        return this.password;
    }

    /**
     * Get password md5
     * @return {String}
     */
    get passwordMD5() {
        if(this.password.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            return this.password.substr(PASSWORD_WITH_MD5_FLAG_LENGTH);
        }
        return this.password;
    }

    /**
     * Set password
     * @param {void}
     */
    setPassword(password) {
        if(password && !password.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            password = PASSWORD_WITH_MD5_FLAG + Md5(password);
        }
        this.password = password;
    }

    /**
     * Get password md5 string with rand in zentao config
     * @return {String}
     */
    get passwordMD5WithRand() {
        if(this.zentaoConfig && this.zentaoConfig.rand) {
            return Md5(this.passwordMD5 + this.zentaoConfig.rand);
        }
        return '';
    }

    /**
     * Check upload file size
     * @param  {number} size
     * @return {boolean}
     */
    checkUploadFileSize(size) {
        if(typeof size === 'object') {
            size = size.size;
        }
        if(this.uploadFileSize) {
            return size <= this.uploadFileSize;
        }
        return true;
    }

    /**
     * Fix user avatar path
     */
    fixAvatar(avatar) {
        if(typeof avatar === 'object') {
            let member = avatar;
            avatar = member.avatar;
            if(avatar && avatar.indexOf('http://') !== 0 && avatar.indexOf('https://') !== 0) {
                member.avatar = this.serverUrlRoot + avatar;
            }
            return member.avatar;
        } else {
            avatar = avatar || this.avatar;
            if(avatar && avatar.indexOf('http://') !== 0 && avatar.indexOf('https://') !== 0) {
                avatar = this.serverUrlRoot + avatar;
            }
            this.avatar = avatar;
            return this.avatar;
        }
    }

    /**
     * Set user status
     * @param  {String} status
     * @return {Void}
     */
    set status(status) {
        this.changeStatus(status);
    }

    /**
     * Change user status
     */
    changeStatus(status, msg, type) {
        if(typeof status === 'string') {
            status = USER_STATUS[status.toLowerCase()];
        }
        if(USER_STATUS[status] !== undefined) {
            this.$('status', status);
            if(this.listenStatus) {
                let lastUserStatusIdentify = Events._lastStatusIdentify;
                let newUserStatusIdentify = this.identify + '$' + status;
                if(lastUserStatusIdentify !== newUserStatusIdentify) {
                    Events._lastStatusIdentify = newUserStatusIdentify;
                    Events.emit(R.event.user_status_change, this, msg, type);
                }
            }
        }
    }

    /**
     * Get user status
     * @return {string}
     */
    get status() {
        return this.$('status');
    }

    /**
     * Check listenStatus
     * @returns {boolean}
     */
    get listenStatus() {
        return this.$('listenStatus');
    }

    /**
     * Set listenStatus
     */
    set listenStatus(toggle) {
        this.$('listenStatus', toggle);
    }

    static STATUS = USER_STATUS;

    static create = user => {
        if(!(user instanceof User)) {
            user = new User(user);
        }
        return user;
    };
}

export {USER_STATUS};
export default User;
