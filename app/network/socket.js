import {Socket} from 'Platform';
import SocketMessage from './socket-message';
import Events from '../core/events';

const PING_INTERVAL = DEBUG ? (1000 * 10) : (1000 * 60 * 2);
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
            super.send(msg.json, () => {
                if(DEBUG) {
                    console.collapse('Socket Send ⬆︎', 'indigoBg', msg.pathname, 'indigoPale');
                    console.log('msg', msg);
                    console.groupEnd();
                }
                resolve(msg);
            });
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

        if(DEBUG) {
            console.collapse('SOCKET Data ⬇︎', 'purpleBg', msg.pathname, 'purplePale', msg.isSuccess ? 'OK' : 'FAILED', msg.isSuccess ? 'greenPale' : 'dangerPale');
            console.log('msg', msg);
            console.log('socket', this);
            console.groupEnd();
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
        Events.emit(EVENT.message, msg, result);
    }

    listenMessage(moduleName, methodName, timeout = LISTEN_TIMEOUT) {
        return new Promise((resolve, reject) => {
            let listenHandler = null;
            const listenTimer = setTimeout(() => {
                if(listenHandler) {
                    Events.off(listenHandler);
                }
                reject();
            }, timeout);
            listenHandler = Events.on(EVENT.message, (msg, result) => {
                if(msg.module === moduleName && msg.method === methodName) {
                    if(listenTimer) {
                        clearTimeout(listenTimer);
                    }
                    if(listenHandler) {
                        Events.off(listenHandler);
                    }
                    resolve(result);
                }
            });
        });
    }

    sendAndListen(msg, check) {
        return new Promise((resolve, reject) => {
            msg = SocketMessage.create(msg);
            this.listenMessage(msg.module, msg.method).then((result) => {
                if(check) {
                    result = check(result);
                }
                if(result) {
                    resolve(result);
                } else {
                    reject();
                }
            }).catch(reject);
            this.send(msg);
        });
    }

    onInit() {
        this.lastHandTime = 0;
        this.lastOkTime   = 0;
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
        const msg = SocketMessage.fromJSON(data);
        this.lastHandTime = new Date().getTime();
        if(Array.isArray(msg)) {
            msg.forEach(x => {
                this.handleMessage(x);
            });
        } else {
            this.handleMessage(msg);
        }
    }

    login(user, options) {
        this.isLogging = true;
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
                    this.isLogging = false;
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
            this.init(user.socketUrl, Object.assign({
                userToken: user.token,
                cipherIV: user.cipherIV,
                connect: true,
                onConnect
            }, options));
        });
    }

    logout() {
        this.markClose();
        if(this.isConnected) {
            this.send('logout');
        } else {
            this.handleClose(null, 'logout');
        }
    }

    uploadUserSettings() {
        return this.sendAndListen({
            'method': 'settings',
            params: [
                this.user.account,
                this.user.config.exportCloud()
            ]
        });
    }

    syncUserSettings() {
        return this.sendAndListen({
            'method': 'settings',
            params: [
                this.user.account,
                ''
            ]
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
            this.close(null, 'ping_timeout');
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
