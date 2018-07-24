import md5 from 'md5';
import {Socket} from 'Platform';
import SocketMessage from './socket-message';
import Events from '../core/events';

const PING_INTERVAL = DEBUG ? (1000 * 60) : (1000 * 60 * 2);
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
            if (!msg.userID) {
                msg.userID = this.user.id;
            }
            super.send(msg.json, () => {
                if (DEBUG) {
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
        if (typeof pathname === 'object') {
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
        if (DEBUG) {
            console.collapse('SOCKET Data ⬇︎', 'purpleBg', msg.pathname, 'purplePale', msg.isSuccess ? 'OK' : 'FAILED', msg.isSuccess ? 'greenPale' : 'dangerPale');
            console.log('msg', msg);
            console.log('socket', this);
            console.groupEnd();
        }

        let handler = this.getHandler(msg.module, msg.method);
        let result;
        if (handler) {
            while (handler && typeof handler === 'string') {
                handler = this.getHandler(handler);
            }
            if (handler) {
                result = handler(msg, this);
            }
        } else {
            result = msg.data;
        }
        if (result === undefined) {
            result = msg.isSuccess;
        }
        Events.emit(EVENT.message, msg, result);
    }

    listenMessage(moduleName, methodName, timeout = LISTEN_TIMEOUT) {
        return new Promise((resolve, reject) => {
            let listenHandler = null;
            const listenTimer = setTimeout(() => {
                if (listenHandler) {
                    Events.off(listenHandler);
                }
                reject();
            }, timeout);
            listenHandler = Events.on(EVENT.message, (msg, result) => {
                if (msg.module === moduleName && msg.method === methodName) {
                    if (listenTimer) {
                        clearTimeout(listenTimer);
                    }
                    if (listenHandler) {
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
                if (check) {
                    result = check(result);
                }
                if (result) {
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
        this.lastHandTime = 0;
    }

    onClose(code, reason, unexpected) {
        this.stopPing();
        if (this.user && this.user.isOnline) {
            this.user[unexpected ? 'markDisconnect' : 'markUnverified']();
        }
    }

    onData(data, flags) {
        const msg = SocketMessage.fromJSON(data);
        if (!msg) {
            if (DEBUG) {
                console.error('Cannot handle data:', data);
            }
            return;
        }
        this.lastHandTime = new Date().getTime();
        if (Array.isArray(msg)) {
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
            if (user) {
                this.user = user;
            } else {
                user = this.user;
            }
            if (!user) {
                return Promise.reject('User is not defined.');
            }
            const onConnect = () => {
                this.listenMessage('chat', 'login').then((result, msg) => {
                    if (result) {
                        this.startPing();
                        this.syncUserSettings();
                        resolve(user);
                    } else {
                        reject('Login result is not success.');
                    }
                    this.isLogging = false;
                }).catch(reject);
                this.send({
                    module: 'chat',
                    method: 'login',
                    params: [
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
                onConnect,
                onConnectFail: (e) => {
                    reject(e);
                }
            }, options));
        });
    }

    logout() {
        if (this.isConnected) {
            this.uploadUserSettings();
            setTimeout(() => {
                this.markClose();
                this.send('logout');
            }, 500);
        } else {
            this.markClose();
            this.handleClose(null, 'logout');
        }
    }

    uploadUserSettings() {
        const needSaveId = this.user.config.needSave;
        return this.sendAndListen({
            method: 'settings',
            params: [
                this.user.account,
                this.user.config.exportCloud()
            ]
        }).then(() => {
            if (this.user.config.needSave === needSaveId) {
                this.user.config.makeSave();
            }
        });
    }

    syncUserSettings() {
        return this.sendAndListen({
            method: 'settings',
            params: [
                this.user.account,
                ''
            ]
        });
    }

    changeUserStatus(status) {
        return this.changeUser({status});
    }

    changeUser(userChangeData) {
        return this.sendAndListen({
            method: 'userchange',
            params: [userChangeData]
        });
    }

    changeUserPassword(password) {
        return this.changeUser({
            password: md5(`${md5(password)}${this.user.account}`)
        });
    }

    ping() {
        const now = new Date().getTime();
        if ((now - this.lastHandTime) > PING_INTERVAL * 2) {
            this.user.markDisconnect();
            this.close(null, 'ping_timeout');
        } else if (!this.handlePing && !this.handlePong && !this.user.isVersionSupport('socketPing')) {
            return this.send('ping');
        }
    }

    /**
     * Stop cyclical ping
     * @return {void}
     */
    stopPing() {
        if (this.pingTask) {
            clearInterval(this.pingTask);
            this.pingTask = null;
        }
    }

    onPing() {
        const now = new Date().getTime();
        if (DEBUG) {
            console.color('SOCKET Ping ⬇︎', 'purpleBg', 'OK', 'greenPale', `${(now - this.lastHandTime) / 1000} seconds`, 'muted');
        }
        this.lastHandTime = new Date().getTime();
    }

    onPong() {
        this.onPing();
    }

    /**
     * Start cyclical ping
     * @return {void}
     */
    startPing() {
        this.stopPing();
        if (this.isConnected) {
            this.pingTask = setInterval(() => {
                const now = new Date().getTime();
                if (now - this.lastHandTime > this.pingInterval) {
                    this.ping();
                }
            }, this.pingInterval / 2);
        } else if (DEBUG) {
            console.error('Start ping fail, because the socket connection is not opened.');
        }
    }
}

export default AppSocket;
