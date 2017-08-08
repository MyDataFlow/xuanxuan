import crypto from './crypto';
import WS from 'ws';
import Events from './events';
import Status from '../../utils/status';

const STATUS = new Status({
    UNCONNECT: -1,  // 未连接
    CONNECTING:	0,	// 连接还没开启。
    OPEN:	    1,	// 连接已开启并准备好进行通信。
    CLOSING:	2,	// 连接正在关闭的过程中。
    CLOSED:	    3,	// 连接已经关闭，或者连接无法建立。
});

const EVENT = {
    socket_data: 'socket.data',
    socket_close: 'socket.close',
    socket_error: 'socket.error',
    socket_connect: 'socket.connect',
    socket_status_change: 'socket.status_change',
};

const PING_INTERVAL = 1000 * 60 * 5;

class Socket {

    static STATUS = STATUS;
    static EVENT  = EVENT;

    constructor(url, options) {
        this._status = STATUS.create(STATUS.UNCONNECT);
        this._status.onChange = newStatus => {
            Events.emit(EVENT.socket_status_change, this, newStatus);
        };
        this.init(url, options);
    }

    init(url, options) {
        options = Object.assign({
            pingInterval: PING_INTERVAL,
            connent: true,
            userToken: '',
            cipherIV: '',
            encryptEnable: true
        }, options);

        this.options = options;
        this.url = url;
        this._status.change(STATUS.UNCONNECT);

        if(options.connect) {
            this.connect();
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

    isStatus(status) {
        return this._status.isStatus(status);
    }

    updateStatusFromClient() {
        if(this.client) {
            this.status = this.client.readyState;
        } else {
            this.status = STATUS.UNCONNECT;
        }
    }

    connect() {
        if(this.client) {
            this.close();
        }

        this.status = STATUS.CONNECTING;
        this.client = new WS(this.url);

        this.client.on('open', this.handleConnect.bind(this));
        this.client.on('message', this.handleData.bind(this));
        this.client.on('close', this.handleClose.bind(this));
        this.client.on('error', this.handleError.bind(this));
        this.client.on('unexpected-response', this.handleError.bind(this));
    }

    reconnect() {
        return this.connect();
    }

    handleConnect() {
        this.updateStatusFromClient();

        if(DEBUG) {
            console.collapse('SOCKET Connected', 'greenBg', this.url, 'greenPale');
            console.log('socket', this);
            console.groupEnd();
        }

        if(this.options.onConnect) {
            this.options.onConnect(this);
        }

        Events.emit(EVENT.socket_connect, this);
    }

    handleClose(code, reason) {
        this.updateStatusFromClient();
        this.client = null;

        if(DEBUG) {
            console.collapse('SOCKET Closed', 'greenBg', this.url, 'greenPale');
            console.log('socket', this);
            console.log('code', code);
            console.log('reason', reason);
            console.groupEnd();
        }

        if(this.options.onClose) {
            this.options.onClose(this, code, reason);
        }

        Events.emit(EVENT.socket_close, this, code, reason);
    }

    handleError(error) {
        this.updateStatusFromClient();

        if(DEBUG) {
            console.collapse('SOCKET Error', 'greenBg', this.url, 'greenPale');
            console.log('socket', this);
            console.log('error', error);
            console.groupEnd();
        }

        if(this.options.onError) {
            this.options.onError(this, code, reason);
        }

        Events.emit(EVENT.socket_error, this, error);
    }

    handleData(rawdata, flags) {
        this.updateStatusFromClient();

        let data = null;
        if(flags && flags.binary) {
            if(this.options.encryptEnable) {
                data = crypto.decrypt(rawdata, this.options.userToken, this.options.cipherIV);
            } else {
                data = rawdata.toString();
            }
        }

        if(DEBUG) {
            console.collapse('SOCKET Data', 'greenBg', this.url, 'greenPale');
            console.log('socket', this);
            console.log('rawdata', rawdata);
            console.log('data', data);
            console.groupEnd();
        }

        if(this.options.onData) {
            this.options.onData(this, data, flags);
        }

        Events.emit(EVENT.socket_data, this, data, flags);
    }

    send(rawdata) {
        let data = null;
        if(this.options.encryptEnable) {
            data = crypto.encrypt(rawdata);
            if(DEBUG) {
                console.collapse('ENCRYPT data', 'blueBg', `length: ${data.length}`, 'bluePale');
                console.log('data', data);
                console.log('rawdata', rawdata);
                console.groupEnd();
            }
        }

        this.client.send(data, {
            binary: this.options.encryptEnable
        }, DEBUG ? () => {
            console.collapse('ENCRYPT data', 'blueBg', `length: ${data.length}`, 'greenPale');
            console.log('rawdata', rawdata);
            console.groupEnd();
        } : null);
    }

    close() {
        if(this.client) {
            this.status = STATUS.CLOSING;
            this.client.close();
        }
    }
}

export default Socket;
