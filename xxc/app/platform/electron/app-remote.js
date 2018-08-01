import electron, {BrowserWindow, app as ElectronApp, Tray, Menu, nativeImage, globalShortcut, ipcMain, dialog} from 'electron';
import fs from 'fs-extra';
import path from 'path';
import Lang from '../../lang';
import Config from '../../config';
import EVENT from './remote-events';
import Events from './events';

const IS_MAC_OSX = process.platform === 'darwin';
const SHOW_LOG = DEBUG;

if (DEBUG && process.type === 'renderer') {
    console.error('AppRemote must run in main process.');
}

const SELECT_MENU = Menu.buildFromTemplate([
    {role: 'copy', label: Lang.string('menu.copy')},
    {type: 'separator'},
    {role: 'selectall', label: Lang.string('menu.selectAll')}
]);

const INPUT_MENU = Menu.buildFromTemplate([
    {role: 'undo', label: Lang.string('menu.undo')},
    {role: 'redo', label: Lang.string('menu.redo')},
    {type: 'separator'},
    {role: 'cut', label: Lang.string('menu.cut')},
    {role: 'copy', label: Lang.string('menu.copy')},
    {role: 'paste', label: Lang.string('menu.paste')},
    {type: 'separator'},
    {role: 'selectall', label: Lang.string('menu.selectAll')}
]);

/**
 * App
 *
 * Only for main process
 */
class AppRemote {
    constructor() {
        this.windows = {};

        // Bind events
        ipcMain.on(EVENT.app_quit, e => {
            this.quit();
        });

        ipcMain.on(EVENT.remote, (e, method, callBackEventName, ...args) => {
            let result = this[method];
            if (typeof result === 'function') {
                result = result.call(this, ...args);
            }
            if (method === 'quit') return;
            if (result instanceof Promise) {
                result.then(x => {
                    e.sender.send(callBackEventName, x);
                }).catch(error => {
                    console.warn('Remote error', error);
                });
            } else {
                e.sender.send(callBackEventName, result);
            }
            if (DEBUG) {
                console.info('\n>> Accept remote call', `${callBackEventName}.${method}(`, args, ')');
            }
        });

        ipcMain.on(EVENT.remote_send, (e, windowName, eventName, ...args) => {
            const browserWindow = this.windows[windowName];
            if (browserWindow) {
                browserWindow.webContents.send(eventName, ...args);
            }
        });

        ipcMain.on(EVENT.remote_on, (e, eventId, event) => {
            const remoteOnEventId = this.on(event, (...args) => {
                try {
                    e.sender.send(eventId, ...args);
                } catch (e) {
                    this.off(eventId);
                    if (SHOW_LOG) {
                        console.error(`\n>> Remote event '${event}' has be force removed, because window is closed.`, e);
                    }
                }
            });
            this._eventsMap[eventId] = {remote: true, id: remoteOnEventId};
            if (SHOW_LOG) console.log('\n>> REMOTE EVENT on', event, eventId);
        });

        ipcMain.on(EVENT.remote_off, (e, eventId) => {
            Events.off(eventId);
            if (SHOW_LOG) console.log('\n>> REMOTE EVENT off', eventId);
        });

        ipcMain.on(EVENT.remote_emit, (e, eventId, ...args) => {
            Events.emit(eventId, ...args);
            if (SHOW_LOG) console.log('\n>> REMOTE EVENT emit', eventId);
        });

        ElectronApp.setName(Lang.string('app.title'));
    }

    init(entryPath) {
        if (!entryPath) {
            throw new Error('Argument entryPath must be set on init app-remote.');
        }

        this.entryPath = entryPath;
        global.entryPath = entryPath;
    }

    ready() {
        this.openMainWindow();
        this.initTrayIcon();
    }

    initTrayIcon() {
        if (this.tray) {
            this.tray.destroy();
        }
        // Make tray icon
        const tray = new Tray(`${this.entryPath}/${Config.media['image.path']}tray-icon-16.png`);
        const trayContextMenu = Menu.buildFromTemplate([
            {
                label: Lang.string('common.open'),
                click: () => {
                    this.showAndFocusWindow();
                }
            }, {
                label: Lang.string('common.exit'),
                click: () => {
                    this.mainWindow.webContents.send(EVENT.remote_app_quit, 'quit');
                }
            }
        ]);
        tray.setToolTip(Lang.string('app.title'));
        tray.on('click', () => {
            this.showAndFocusWindow();
        });
        tray.on('right-click', () => {
            tray.popUpContextMenu(trayContextMenu);
        });
        this.tray = tray;
        this._trayIcons = [
            nativeImage.createFromPath(`${this.entryPath}/${Config.media['image.path']}tray-icon-16.png`),
            nativeImage.createFromPath(`${this.entryPath}/${Config.media['image.path']}tray-icon-transparent.png`)
        ];
        this._trayIconCounter = 0;
    }

    createMainWindow(options) {
        options = Object.assign({
            width: 900,
            height: 650,
            minWidth: 400,
            minHeight: 650,
            url: 'index.html',
            hashRoute: '/index',
            name: 'main',
            resizable: true,
            debug: true
        }, options);

        if (DEBUG) {
            const display = electron.screen.getPrimaryDisplay();
            options.height = display.workAreaSize.height;
            options.width = 800;
            options.x = display.workArea.x;
            options.y = display.workArea.y;
        }
        this.mainWindow = this.createWindow(options);
    }

    createWindow(name, options) {
        if (typeof name === 'object') {
            options = name;
            name = options.name;
        }

        options = Object.assign({
            name,
            showAfterLoad: true,
            hashRoute: `/${name}`,
            url: 'index.html',
            autoHideMenuBar: !IS_MAC_OSX,
            backgroundColor: '#ffffff',
            show: DEBUG,
            webPreferences: {webSecurity: false}
        }, options);

        let browserWindow = this.windows[name];
        if (browserWindow) {
            throw new Error(`The window with name '${name}' has already be created.`);
        }

        const windowSetting = Object.assign({}, options);
        ['url', 'showAfterLoad', 'debug', 'hashRoute', 'onLoad', 'beforeShow', 'afterShow', 'onClosed'].forEach(optionName => {
            delete windowSetting[optionName];
        });
        browserWindow = new BrowserWindow(windowSetting);
        // if(DEBUG) console.log('\n>> Create window with settings', windowSetting);
        this.windows[name] = browserWindow;
        browserWindow.on('closed', () => {
            delete this.windows[name];
            if (options.onClosed) {
                options.onClosed(name);
            }
        });

        browserWindow.webContents.on('did-finish-load', () => {
            if (options.showAfterLoad) {
                if (options.beforeShow) {
                    options.beforeShow(browserWindow, name);
                }
                browserWindow.show();
                browserWindow.focus();
                if (options.afterShow) {
                    options.afterShow(browserWindow, name);
                }
            }
            if (options.onLoad) {
                options.onLoad(browserWindow);
            }
        });

        browserWindow.webContents.on('will-navigate', event => {
            event.preventDefault();
        });

        let {url} = options;
        if (url) {
            if (!url.startsWith('file://') && !url.startsWith('http://') && !url.startsWith('https://')) {
                url = `file://${this.entryPath}/${options.url}`;
            }
            if (DEBUG) {
                url += '?react_perf';
            }
            if (options.hashRoute) {
                url += `#${options.hashRoute}`;
            }
            browserWindow.loadURL(url);
        }

        if (options.debug && DEBUG) {
            browserWindow.openDevTools();
            browserWindow.webContents.on('context-menu', (e, props) => {
                const {x, y} = props;
                Menu.buildFromTemplate([{
                    label: Lang.string('debug.inspectElement'),
                    click() {
                        browserWindow.inspectElement(x, y);
                    }
                }]).popup(browserWindow);
            });

            browserWindow.webContents.on('crashed', function () {
                const options = {
                    type: 'info',
                    title: 'Renderer process crashed.',
                    message: 'The renderer process has been crashed, you can reload or close it.',
                    buttons: ['Reload', 'Close']
                };
                dialog.showMessageBox(options, (index) => {
                    if (index === 0) {
                        browserWindow.reload();
                    }
                    else {
                        browserWindow.close();
                    }
                });
            })
        }

        // if(DEBUG) {
        //     console.log('\n>> Create window', name, url, options);
        // }

        return browserWindow;
    }

    openMainWindow() {
        const mainWindow = this.mainWindow;
        if (!mainWindow) {
            this.createMainWindow();
        } else if (!mainWindow.isVisible()) {
            mainWindow.show();
            mainWindow.focus();
        }
    }

    get mainWindow() {
        return this.windows.main;
    }

    set mainWindow(mainWindow) {
        if (!mainWindow) {
            delete this.windows.main;
        } else {
            this.windows.main = mainWindow;
            mainWindow.on('close', e => {
                if (this.markClose) return;
                const now = new Date().getTime();
                if (this.lastRequestCloseTime && (now - this.lastRequestCloseTime) < 1000) {
                    electron.dialog.showMessageBox(mainWindow, {
                        buttons: [Lang.string('common.exitIM'), Lang.string('common.cancel')],
                        defaultId: 0,
                        type: 'question',
                        message: Lang.string('common.comfirmQuiteIM')
                    }, response => {
                        if (response === 0) {
                            setTimeout(() => {
                                this.quit();
                            }, 0);
                        }
                    });
                } else {
                    this.lastRequestCloseTime = now;
                    mainWindow.webContents.send(EVENT.remote_app_quit);
                }
                e.preventDefault();
                return false;
            });
            mainWindow.webContents.on('context-menu', (e, props) => {
                const {selectionText, isEditable} = props;
                if (isEditable) {
                    INPUT_MENU.popup(mainWindow);
                }
            });
        }
    }

    closeMainWindow() {
        this.markClose = true;
        const mainWindow = this.mainWindow;
        if (mainWindow) {
            mainWindow.close();
        }
    }

    sendToWindows(channel, ...args) {
        Object.keys(this.windows).forEach(name => {
            this.sendToWindow(name, channel, ...args);
        });
    }

    sendToWindow(name, channel, ...args) {
        const browserWindow = this.windows[name];
        if (browserWindow) {
            browserWindow.webContents.send(channel, ...args);
        }
    }

    /**
     * Set tooltip text on tray icon
     * @param  {string | false} tooltip
     * @return {void}
     */
    trayTooltip(tooltip) {
        this.tray.setToolTip(tooltip || Lang.string('app.title'));
    }

    /**
     * Flash tray icon
     * @param  {boolean} flash
     * @return {void}
     */
    flashTrayIcon(flash = true) {
        if (flash) {
            if (!this._flashTrayIconTask) {
                this._flashTrayIconTask = setInterval(() => {
                    this.tray.setImage(this._trayIcons[(this._trayIconCounter++) % 2]);
                }, 400);
            }
        } else {
            if (this._flashTrayIconTask) {
                clearInterval(this._flashTrayIconTask);
                this._flashTrayIconTask = null;
            }
            this.tray.setImage(this._trayIcons[0]);
        }
    }

    /**
     * Show and focus window
     */
    showAndFocusWindow(windowName = 'main') {
        const browserWindow = this.windows[windowName];
        if (browserWindow) {
            if (browserWindow.isMinimized()) {
                browserWindow.restore();
            } else {
                browserWindow.show();
            }
            browserWindow.focus();
        }
    }

    /**
     * Close main window and quit
     */
    quit() {
        this.closeMainWindow();
        this.tray.destroy();
        globalShortcut.unregisterAll();
        ElectronApp.quit();
    }

    dockBadgeLabel(label) {
        if (IS_MAC_OSX) {
            ElectronApp.dock.setBadge(label);
        }
    }

    dockBounce(type = 'informational') {
        if (IS_MAC_OSX) {
            ElectronApp.dock.bounce(type);
        }
    }
}

const app = new AppRemote();
if (DEBUG) console.info('App created.');

export default app;
