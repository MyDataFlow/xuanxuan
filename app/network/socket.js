import Platform, {Socket} from 'Platform';
import SocketMessage from './socket-message';

const PING_INTERVAL = 1000 * 60 * 5;
const LISTEN_TIMEOUT = 1000 * 15;

const EVENT = {
    message: 'app_socket.message',
};

class AppSocket extends Socket {

    constructor() {
        super();
        this.pingInterval = PING_INTERVAL;

        this.handlers = {};
    }

    send(msg) {
        return new Promise((resolve) => {
            msg = SocketMessage.create(msg);
            if(!msg.userID) {
                msg.userID = this.user.id;
            }
            super.send(msg.json, resolve);
        });
    }

    /**
     * Set socket message handler
     * @param {String} moduleName
     * @param {String} methodName
     * @param {Function} func
     */
    setHandler(pathname, func) {
        if(typeof pathname === 'object') {
            Object.keys(pathname).forEach(name => {
                this.handlers[name.toLowerCase()] = pathname[name];
            });
        } else {
            this.handlers[pathname.toLowerCase()] = func;
        }
    }

    /**
     * Get socketmessage handler
     * @return {Function}
     */
    getHandler(...pathnames) {
        const pathname = pathnames.join('/').toLowerCase();
        return this.handlers[pathname];
    }

    handleMessage(msg) {
        if(msg.isSuccess) {
            this.lastOkTime = this.lastHandTime;
        }

        let handler = this.getHandler(msg.module, msg.method);
        let result;
        if(handler) {
            while(handler && typeof handler === 'string') {
                handler = this.getHandler(handler);
            }
            if(handler) {
                result = handler(msg, this);
            }
        }
        if(result === undefined) {
            result = msg.isSuccess;
        }
        Platform.events.emit(EVENT.message, msg, result);
    }

    listenMessage(moduleName, methodName, timeout = LISTEN_TIMEOUT) {
        return new Promise((resolve, reject) => {
            let listenHandler = null;
            const listenTimer = setTimeout(() => {
                if(listenHandler) {
                    Platform.events.off(listenHandler);
                }
                reject();
            }, timeout);
            listenHandler = Platform.events.on(EVENT.message, (msg, result) => {
                if(msg.module === moduleName && msg.method === methodName) {
                    if(listenTimer) {
                        clearTimeout(listenTimer);
                    }
                    if(listenHandler) {
                        Platform.events.off(listenHandler);
                    }
                    resolve(result, msg);
                }
            });
        });
    }

    onInit() {
        this.lastHandTime = 0;
        this.lastOkTime   = 0;
    }

    onConnect() {
        this.login();
    }

    onClose(code, reason, unexpected) {
        this.stopPing();
        if(this.user) {
            if(unexpected) {
                this.user.markDisconnect();
            } else {
                this.user.markUnverified();
            }
        }
    }

    onData(data, flags) {
        const msg = SocketMessage.create(data);
        this.lastHandTime = new Date().getTime();
        if(Array.isArray(msg)) {
            msg.forEach(x => {
                this.handleMessage(x);
            });
        } else {
            this.handleMessage(msg);
        }
    }

    login(user) {
        return new Promise((resolve, reject) => {
            if(user) {
                this.user = user;
            } else {
                user = this.user;
            }
            if(!user) {
                return Promise.reject('User is not defined.');
            }
            const onConnect = () => {
                this.listenMessage('chat', 'login').then((result, msg) => {
                    if(result) {
                        this.startPing();
                        resolve(user);
                    } else {
                        reject();
                    }
                }).catch(reject);
                this.send({
                    'module': 'chat',
                    'method': 'login',
                    'params': [
                        user.serverName,
                        user.account,
                        user.passwordMD5,
                        'online'
                    ]
                });
            };
            this.init(user.socketUrl, {
                userToken: user.token,
                cipherIV: user.cipherIV,
                onConnect
            });
        });
    }

    logout() {
        this.send('logout');
    }

    uploadUserSettings() {
        return new Promise((resolve, reject) => {
            this.listenMessage('chat', 'settings').then((result, msg) => {
                if(msg.isSuccess) {
                    resolve();
                } else {
                    reject();
                }
            }).catch(reject);
            this.send({
                'method': 'settings',
                params: [
                    this.user.account,
                    this.user.config.exportCloud()
                ]
            });
        });
    }

    syncUserSettings() {
        return new Promise((resolve, reject) => {
            this.listenMessage('chat', 'settings').then((result, msg) => {
                if(msg.isSuccess) {
                    resolve();
                } else {
                    reject();
                }
            }).catch(reject);
            this.send({
                'method': 'settings',
                params: [
                    this.user.account,
                    ''
                ]
            });
        });
    }

    changeUserStatus(status) {
        return this.send({
            'method': 'userChange',
            'params': [{status}]
        });
    }

    ping() {
        const now = new Date().getTime();
        if((now - this.lastHandTime) > PING_INTERVAL * 2) {
            this.user.markDisconnect();
        } else {
            return this.send('ping');
        }
    }

    /**
     * Stop cyclical ping
     * @return {void}
     */
    stopPing() {
        if(this.pingTask) {
            clearInterval(this.pingTask);
            this.pingTask = null;
        }
    }

    /**
     * Start cyclical ping
     * @return {void}
     */
    startPing() {
        this.stopPing();

        if(this.isConnected) {
            this.pingTask = setInterval(() => {
                const now = new Date().getTime();
                if(now - this.lastOkTime > this.pingInterval) {
                    this.ping();
                }
            }, this.pingInterval/2);
        } else if(DEBUG) {
            console.error('Start ping fail, because the socket connection is not opened.');
        }
    }
}

export default AppSocket;
