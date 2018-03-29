import crypto from './crypto';
import Status from '../../utils/status';

const STATUS = new Status({
    CONNECTING: 0, // 连接还没开启。
    OPEN: 1, // 连接已开启并准备好进行通信。
    CLOSING: 2, // 连接正在关闭的过程中。
    CLOSED: 3, // 连接已经关闭，或者连接无法建立。
    UNCONNECT: 4, // 未连接
}, 4);


class Socket {
    static STATUS = STATUS;

    constructor(url, options) {
        this._status = STATUS.create(STATUS.UNCONNECT);
        this._status.onChange = (newStatus, oldStatus) => {
            if (this.onStatusChange) {
                this.onStatusChange(newStatus, oldStatus);
            }
        };

        if (url) {
            this.init(url, options);
        }
    }

    init(url, options) {
        // Close socket before init
        this.close();

        options = Object.assign({
            connent: true,
            userToken: '',
            cipherIV: '',
            encryptEnable: true
        }, options);

        this.options = options;
        this.url = url;
        this._status.change(STATUS.UNCONNECT);

        if (options.connect && this.url) {
            this.connect();
        }

        if (this.onInit) {
            this.onInit();
        }
    }

    get status() {
        return this._status.value;
    }

    get statusName() {
        return this._status.name;
    }

    set status(newStatus) {
        this._status.change(newStatus);
    }

    get isConnected() {
        return this.isStatus(STATUS.OPEN);
    }

    get isConnecting() {
        return this.isStatus(STATUS.CONNECTING);
    }

    isStatus(status) {
        return this._status.is(status);
    }

    updateStatusFromClient() {
        if (this.client) {
            this.status = this.client.readyState;
        } else {
            this.status = STATUS.UNCONNECT;
        }
    }

    connect() {
        this.close();

        this.status = STATUS.CONNECTING;

        const client = new WebSocket(this.url);
        client.binaryType = 'arraybuffer';
        client.onopen = this.handleConnect.bind(this);
        client.onmessage = e => {
            this.handleData(e.data, {binary: true});
        };
        client.onclose = e => {
            if (!this.isConnected) {
                this.handleConnectFail(e);
            }
            this.handleClose(e.code, e.reason);
        };
        client.onerror = e => {
            this.handleError(e);
        };

        this.client = client;
    }

    reconnect() {
        return this.connect();
    }

    handleConnectFail(e) {
        if (this.onConnectFail) {
            this.onConnectFail(e);
        }
        if (this.options.onConnectFail) {
            this.options.onConnectFail(e);
        }
    }

    handleConnect() {
        this.updateStatusFromClient();

        if (DEBUG) {
            console.collapse('SOCKET Connected', 'greenBg', this.url, 'greenPale');
            console.log('socket', this);
            console.groupEnd();
        }

        if (this.options.onConnect) {
            this.options.onConnect(this);
        }

        if (this.onConnect) {
            this.onConnect();
        }
    }

    handleClose(code, reason) {
        const unexpected = !this._status.is(STATUS.CLOSING);
        this.updateStatusFromClient();
        this.client = null;

        if (DEBUG) {
            console.collapse('SOCKET Closed', 'greenBg', this.url, 'greenPale');
            console.log('socket', this);
            console.log('code', code);
            console.log('reason', reason);
            console.groupEnd();
        }

        if (this.options.onClose) {
            this.options.onClose(this, code, reason, unexpected);
        }

        if (this.onClose) {
            this.onClose(code, reason, unexpected);
        }
    }

    handleError(error) {
        this.updateStatusFromClient();

        if (DEBUG) {
            console.collapse('SOCKET Error', 'redBg', this.url, 'redPale');
            console.log('socket', this);
            console.log('error', error);
            console.groupEnd();
        }

        if (this.options.onError) {
            this.options.onError(this, error);
        }

        if (this.onError) {
            this.onError(error);
        }
    }

    handleData(rawdata, flags) {
        this.updateStatusFromClient();

        let data = null;
        if (flags && flags.binary) {
            if (this.options.encryptEnable) {
                data = crypto.decrypt(rawdata, this.options.userToken, this.options.cipherIV);
            } else {
                data = rawdata.toString();
            }
        }

        // if(DEBUG) {
        //     console.collapse('SOCKET Data', 'greenBg', this.url, 'greenPale');
        //     console.log('socket', this);
        //     console.log('rawdata', rawdata);
        //     console.log('data', {data});
        //     console.groupEnd();
        // }

        if (this.options.onData) {
            this.options.onData(this, data, flags);
        }

        if (this.onData) {
            this.onData(data, flags);
        }
    }

    send(rawdata, callback) {
        let data = null;
        if (this.options.encryptEnable) {
            data = crypto.encrypt(rawdata, this.options.userToken, this.options.cipherIV);
            // if (DEBUG) {
            //     console.collapse('ENCRYPT data', 'blueBg', `length: ${data.length}`, 'bluePale');
            //     console.log('data', data);
            //     console.log('rawdata', rawdata);
            //     console.groupEnd();
            // }
        }

        this.client.send(data, {
            binary: this.options.encryptEnable
        });
        if (callback) {
            callback();
        }
    }

    markClose() {
        this.status = STATUS.CLOSING;
    }

    removeAllListeners() {
        this.client.onclose = null;
        this.client.onerror = null;
        this.client.onmessage = null;
        this.client.onopen = null;
    }

    close(code, reason) {
        if (this.client) {
            if (reason === 'close' || reason === 'KICKOFF') {
                this.markClose();
            }
            this.removeAllListeners();
            this.client.close();
            this.handleClose(code, reason);
        }
    }
}

export default Socket;
