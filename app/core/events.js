import {EventEmitter} from 'Platform';

/**
 * 使用EventEmitter来做消息总线
 */
const EVENT = {
    data_change: 'data.change',
};

const DATA_CHANGE_DELAY = 110;

/**
 * Events emitter
 * Can be used in both main process and renderer process
 *
 * @class Events
 * @extends {EventEmitter}
 */
class Events extends EventEmitter {
    static EVENT = EVENT;

    /**
     * Event center constructor
     */
    constructor() {
        super();
        /**
         * 先建立事件列表
         * 判定自己是否是主进程，非浏览器，非render
         * 设置事件监听上限
         */
        this.eventsMap = {};
        this.isMainProcess = !process.browser && process.type !== 'renderer';
        if (this.setMaxListeners) {
            this.setMaxListeners(20);
        }
    }

    /**
     * Bind event
     * @param  {String} event
     * @param  {Function} listener
     * @return {Symbol}
     */
    on(event, listener) {
        super.on(event, listener);
        const name = Symbol(event);
        /**
         * 保存监听者，事件名字，事件
         */
        this.eventsMap[name] = {listener, name: event};
        if (DEBUG) {
            if (this.isMainProcess) {
                console.log('\n>> ON EVENT', event);
            } else {
                console.collapse('ON EVENT', 'orangeBg', event, 'orangePale');
                console.trace('event', this.eventsMap[name]);
                console.groupEnd();
            }
        }
        return name;
    }

    /**
     * Bind once event
     * @param  {String} event
     * @param  {Function} listener
     * @return {Symbol}
     */
    once(event, listener) {
        const name = Symbol(event);
        const listenerBinder = (...args) => {
            this.off(name);
            listener(...args);
        };
        super.once(event, listenerBinder);
        this.eventsMap[name] = {listener: listenerBinder, name: event};
        if (DEBUG) {
            if (this.isMainProcess) {
                console.log('\n>> ON ONCE EVENT', event);
            } else {
                console.collapse('ON ONCE EVENT', 'orangeBg', event, 'orangePale');
                console.trace('event', this.eventsMap[name]);
                console.groupEnd();
            }
        }
        return name;
    }

    /**
     * Unbind event
     * @param  {...[Symbol]} names
     * @return {Void}
     */
    off(...names) {
        if (this.eventsMap) {
            names.forEach(name => {
                const event = this.eventsMap[name];
                if (event) {
                    this.removeListener(event.name, event.listener);
                    delete this.eventsMap[name];
                    if (DEBUG) {
                        if (this.isMainProcess) {
                            console.log('OFF EVENT', event.name);
                        } else {
                            console.collapse('OFF EVENT', 'orangeBg', event.name, 'orangePale');
                            console.trace('event', event);
                            console.groupEnd();
                        }
                    }
                }
            });
        }
    }

    /**
     * Emit event
     */
    emit(names, ...args) {
        super.emit(names, ...args);
        if (DEBUG) {
            if (this.isMainProcess) {
                console.log('\n>> EMIT EVENT', names);
            } else {
                console.collapse('EMIT EVENT', 'orangeBg', names, 'orangePale');
                args.forEach((arg, argIdx) => {
                    console.log(`arg: ${argIdx}`, arg);
                });
                console.groupEnd();
            }
        }
    }

    onDataChange(listener) {
        return this.on(EVENT.data_change, listener);
    }

    emitDataChange(data, delay = DATA_CHANGE_DELAY) {
        if (typeof data === 'object') {
            if (this.delayEmitData && data) {
                Object.keys(data).forEach(dataKey => {
                    this.delayEmitData[dataKey] = Object.assign(this.delayEmitData[dataKey] || {}, data[dataKey]);
                });
            } else {
                this.delayEmitData = data;
            }
        } else if (DEBUG) {
            console.warn('Events.emitDataChange error, because the data param is not object.');
        }
        if (this.delayEmitDataChangeEventTimer) {
            clearTimeout(this.delayEmitDataChangeEventTimer);
        }
        this.delayEmitDataChangeEventTimer = setTimeout(() => {
            if (this.delayEmitData && Object.keys(this.delayEmitData).length) {
                const changedData = Object.assign({}, this.delayEmitData);
                this.emit(EVENT.data_change, changedData);
            }
            this.delayEmitData = null;
            this.delayEmitDataChangeEventTimer = null;
        }, delay);
    }
}

const events = new Events();

export default events;
