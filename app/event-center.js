import electron     from 'electron';
import EventEmitter from 'events';
import {EVENT}      from './resource';

class EventCenter extends EventEmitter {

    /**
     * Event center constructor
     */
    constructor() {
        super();
        this.isMainProcess = process.type !== 'renderer';
        this.ipc = (this.isMainProcess && electron.ipcMain) ? electron.ipcMain : electron.ipcRenderer;
    }

    /*
     * Send event to window
     */
    sendToWindow(windowName, eventName, ...args) {
        if(this.isMainProcess) {
            if(DEBUG) console.error('Can not send to window in main process');
            return;
        }
        this.ipc.send(EVENT.app_remote_send, windowName, eventName, ...args);
    }

    /*
     * Send event to main window
     */
    sendToMainWindow(eventName, ...args) {
        return this.sendToWindow('main', eventName, ...args);
    }
    
    /**
     * Bind event
     * @param  {String} event
     * @param  {Function} listener
     * @return {Symbol}
     */
    on(event, listener) {
        super.on(event, listener);
        let name = Symbol(event);
        if(!this._eventsMap) this._eventsMap = {};
        this._eventsMap[name] = {listener, name: event};
        if(DEBUG) {
            console.groupCollapsed('%cON EVENT ' + event, 'color: #FF9800; display: inline-block; font-size: 10px; padding: 1px 5px; border-radius: 2px; border: 1px dotted #ff9800;');
            console.trace('event', this._eventsMap[name]);
            console.groupEnd();
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
        super.once(event, listener);
        let name = Symbol(event);
        if(!this._eventsMap) this._eventsMap = {};
        this._eventsMap[name] = {listener, name: event};
        if(DEBUG) {
            console.groupCollapsed('%cON ONCE EVENT ' + event, 'color: #FF9800; display: inline-block; font-size: 10px; padding: 1px 5px; border-radius: 2px; border: 1px dotted #ff9800;');
            console.trace('event', this._eventsMap[name]);
            console.groupEnd();
        }
        return name;
    }

    /**
     * Unbind event
     * @param  {...[Symbol]} names
     * @return {Void}
     */
    off(...names) {
        if(this._eventsMap) {
            names.forEach(name => {
                let event = this._eventsMap[name];
                if(event) {
                    this.removeListener(event.name, event.listener);
                    delete this._eventsMap[name];
                    if(DEBUG) {
                        console.groupCollapsed('%cOFF EVENT%c' + name, 'color: #FF9800; display: inline-block; font-size: 10px; padding: 1px 5px; border-radius: 2px 0 0 2px; border: 1px dotted #ff9800; border-right: 0;', 'background: #FF9800; color: #fff; display: inline-block; font-size: 10px; padding: 1px 5px; border-radius: 0 2px 2px 0; border: 1px dotted #ff9800; border-left: 0; font-weight: bold;');
                        console.trace('event', event);
                        console.groupEnd();
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
            console.groupCollapsed('%cEMIT EVENT%c' + names, 'color: #EF6C00; display: inline-block; font-size: 10px; padding: 1px 5px; border-radius: 2px 0 0 2px; border: 1px solid #EF6C00; border-right: 0;', 'background: #EF6C00; color: #fff; display: inline-block; font-size: 10px; padding: 1px 5px; border-radius: 0 2px 2px 0; border: 1px solid #EF6C00; border-left: 0; font-weight: bold;');
            let argIdx = 0;
            for(let arg of args) {
                console.log('arg' + argIdx++, arg);
            }
            console.groupEnd();
        }
    }
}

const eventCenter = new EventCenter();

if(DEBUG) console.log('%cEventCenter [' + process.type + ']', 'color: #fff; background: orange')

export default eventCenter;
