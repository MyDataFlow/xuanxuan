import EventEmitter from 'events';

/**
 * Events emitter
 * Can be used in both main process and renderer process
 *
 * @class Events
 * @extends {EventEmitter}
 */
class Events extends EventEmitter {

    /**
     * Event center constructor
     */
    constructor() {
        super();
        this.$             = EVENT;
        this.eventsMap     = {};
        this.isMainProcess = process.type !== 'renderer';

        if(!DEBUG) {
            this.setMaxListeners(0);
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
        this.eventsMap[name] = {listener, name: event};
        if(DEBUG) {
            if(this.isMainProcess) {
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
        let listenerBinder = (...args) => {
            this.off(name);
            listener(...args);
        };
        super.once(event, listenerBinder);
        this.eventsMap[name] = {listener: listenerBinder, name: event};
        if(DEBUG) {
            if(this.isMainProcess) {
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
        if(this.eventsMap) {
            names.forEach(name => {
                let event = this.eventsMap[name];
                if(event) {
                    this.removeListener(event.name, event.listener);
                    delete this.eventsMap[name];
                    if(DEBUG) {
                        if(this.isMainProcess) {
                            console.log('OFF EVENT', event.name);
                        } else {
                            console.log('OFF EVENT', 'orangeBg', event.name, 'orangePale');
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
        if(DEBUG) {
            if(this.isMainProcess) {
                console.log('\n>> EMIT EVENT', names);
            } else {
                console.collapse('EMIT EVENT', 'orangeBg', names, 'orangePale');
                let argIdx = 0;
                for(let arg of args) {
                    console.log('arg:' + argIdx++, arg);
                }
                console.groupEnd();
            }
        }
    }
}

const events = new Events();

if(DEBUG) global.Events = events;

export default events;
