import {
    shell,
    clipboard,
    remote as Remote,
    screen as Screen,
    nativeImage as NativeImage,
}                         from 'electron';
import Path               from 'path';
import React              from 'react';
import ReactDOM           from 'react-dom';
import UUID               from 'uuid';
import Helper             from './utils/helper';
import R, {EVENT}         from './resource';
import Lang               from 'Lang';
import takeScreenshot     from 'Utils/screenshot';
import AppBase            from './app-base';

if(DEBUG && process.type !== 'renderer') {
    console.error('App must run in renderer process.');
}

const Menu           = Remote.Menu;
const MenuItem       = Remote.MenuItem;
const Dialog         = Remote.dialog;
const BrowserWindow  = Remote.BrowserWindow;
const GlobalShortcut = Remote.globalShortcut;

/**
 * Application
 *
 * Only for renderer process
 */
class App extends AppBase {

    /**
     * Application constructor
     */
    constructor() {
        super();

        this.ipc.on(R.event.app_main_window_close, () => {
            this.emit(R.event.app_main_window_close);
        });
        this.ipc.on(R.event.app_quit, () => {
            this.emit(R.event.app_quit);
        });
    }

    /**
     * Quit application
     */
    quit() {
        super.quit();
        setTimeout(() => {
            this.remote('quit');
        }, 1500);
    }
}

const app = new App();

global.App = app;
const config = app.config;

export {config as Config, app as App, Lang}
export default app;
