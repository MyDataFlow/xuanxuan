import 'ion-sound';
import {
    shell,
    clipboard,
    remote as Remote,
    screen as Screen,
    nativeImage as NativeImage,
    desktopCapturer
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

        this._desktopPath   = Remote.app.getPath('desktop');

        this.remote('appRoot').then(appRoot => {
            this._appRoot = appRoot;
        });

        this.ipc.on(R.event.app_main_window_close, () => {
            this.emit(R.event.app_main_window_close);
        });
        this.ipc.on(R.event.app_quit, () => {
            this.emit(R.event.app_quit);
        });
    }

    get ipc() {
        return this.event.ipc;
    }

    get userDataPath() {
        if(this._userDataPath === undefined) {
            this._userDataPath = Remote.app.getPath('userData');
        }
        return this._userDataPath;
    }

    get browserWindow() {
        if(this._browserWindow === undefined) {
            this._browserWindow = Remote.getCurrentWindow();
        }
        return this._browserWindow;
    }

    openExternal(path, options) {
        shell.openExternal(path, options);
    }

    /**
     * Request attention to the main window
     * @return {void}
     */
    requestAttention(attention = true) {
        if(attention) {
            this.remote('dockBounce', 'informational');
        }
        this.browserWindow.flashFrame(attention);
    }

    setShowInTaskbar(flag) {
        this.browserWindow.setSkipTaskbar(!flag);
    }

    /**
     * Get remote property or call remote methods
     */
    remote(method, ...args) {
        return new Promise((resolve, reject) => {
            let callBackEventName = EVENT.app_remote + '.' + Helper.guid;
            this.ipc.once(callBackEventName, (e, remoteResult) => {
                resolve(remoteResult);
            });
            this.ipc.send(EVENT.app_remote, method, callBackEventName, ...args);
        });
    }

    /**
     * Set current badage label
     * @param  {string | false} label
     * @return {void}
     */
    set badgeLabel(label = '') {
        this.remote('dockBadgeLabel', (label || '') + '');
        if(Helper.isWindowsOS) {
            return;
            if(!label) {
                this.browserWindow.setOverlayIcon(null, '');
                return;
            }

            // Create badge
            let canvas = document.createElement('canvas');
            canvas.height = 140;
            canvas.width = 140;
            let ctx = canvas.getContext('2d');
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.ellipse(70, 70, 70, 70, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';

            if (label.length > 2) {
                ctx.font = '75px sans-serif';
                ctx.fillText('' + label, 70, 98);
            } else if (label.length > 1) {
                ctx.font = '100px sans-serif';
                ctx.fillText('' + label, 70, 105);
            } else {
                ctx.font = '125px sans-serif';
                ctx.fillText('' + label, 70, 112);
            }

            const badgeDataURL = canvas.toDataURL();
            this.remote('setOverlayIcon', badgeDataURL, label);
        }
    }

    get isWindowsFocus() {
        return this.browserWindow.isFocused();
    }

    /**
     * Check whether the main window is open
     */
    get isWindowOpen() {
        return !this.browserWindow.isMinimized() && this.browserWindow.isVisible();
    }

    /**
     * Set tooltip text on tray icon
     * @param  {string | false} tooltip
     * @return {void}
     */
    set trayTooltip(tooltip) {
        this.remote('trayTooltip', tooltip);
    }

    /**
     * Flash tray icon
     * @param  {boolean} flash
     * @return {void}
     */
    flashTrayIcon(flash = true) {
        this.remote('flashTrayIcon', flash);
    }

    /**
     * Create context menu
     * @param  {Array[Object]} items
     * @return {Menu}
     */
    createContextMenu(menu) {
        if(Array.isArray(menu) && !menu.popup) {
            menu = Menu.buildFromTemplate(menu);
        }
        return menu;
    }

    /**
     * Popup context menu
     */
    popupContextMenu(menu, x, y) {
        if(typeof x === 'object') {
            y = x.clientY;
            x = x.clientX;
        }
        menu = this.createContextMenu(menu);
        menu.popup(this.browserWindow, x, y);
    }

    /**
     * Show save dialog
     * @param object   options
     */
    showSaveDialog(options, callback) {
        if(options.sourceFilePath) {
            let sourceFilePath = options.sourceFilePath;
            delete options.sourceFilePath;
            return this.showSaveDialog(options, filename => {
                if(filename) {
                    Helper.copyFile(sourceFilePath, filename)
                          .then(() => {
                             callback && callback(filename);
                          }).catch(callback);
                } else {
                    callback && callback();
                }
            });
        }

        let filename = options.fileName || '';
        delete options.fileName;

        options = Object.assign({
            title: Lang.dialog.fileSaveTo,
            defaultPath: Path.join(this.user.getConfig('local.ui.app.lastFileSavePath', this.desktopPath), filename)
        }, options);
        Dialog.showSaveDialog(this.browserWindow, options, filename => {
            if(filename) {
                this.user.setConfig('local.ui.app.lastFileSavePath', Path.dirname(filename));
            }
            callback && callback(filename);
        });
    }

    /**
     * Show open dialog
     */
    showOpenDialog(options, callback) {
        options = Object.assign({
            title: Lang.dialog.openFile,
            defaultPath: this.desktopPath,
            properties: ['openFile']
        }, options);
        Dialog.showOpenDialog(this.browserWindow, options, callback);
    }

    /**
     * Capture screenshot image and save to file
     *
     * @param string filePath optional
     */
    captureScreen(options, filePath, hideCurrentWindow, onlyBase64) {
        if(!filePath) {
            filePath = this.user.makeFilePath(UUID.v4() + '.png');
        }
        if(!options) {
            options = {};
        }
        let processImage = base64Image => {
            if(hideCurrentWindow) {
                this.browserWindow.show();
            }
            if(onlyBase64) return Promise.resolve(base64Image);
            return Helper.saveImage(base64Image, filePath);
        };
        if(hideCurrentWindow && this.browserWindow.isVisible()) {
            if(Helper.isWindowsOS) {
                let hideWindowTask = () => {
                    this.browserWindow.hide();
                    return new Promise((resolve, reject) => {
                        setTimeout(resolve, 600);
                    });
                };
                return hideWindowTask().then(() => {
                    return takeScreenshot(options);
                }).then(processImage);
            }
            this.browserWindow.hide();
        }
        return takeScreenshot(options).then(processImage);
    }

    /**
     * Open capture screen window
     */
    openCaptureScreen(screenSources = 0, hideCurrentWindow = false) {
        let openCaptureScreenWindow = (file, display) => {
            return new Promise((resolve, reject) => {
                let captureWindow = new BrowserWindow({
                    x: display ? display.bounds.x : 0,
                    y: display ? display.bounds.y : 0,
                    width: display ? display.bounds.width : screen.width,
                    height: display ? display.bounds.height : screen.height,
                    alwaysOnTop: !DEBUG,
                    fullscreen: true,
                    frame: true,
                    show: false,
                    title: Lang.chat.captureScreen + ' - ' + display.id,
                    titleBarStyle: 'hidden',
                    resizable: false,
                });
                if (DEBUG) {
                    captureWindow.openDevTools();
                }
                captureWindow.loadURL(`file://${this.appRoot}/capture-screen.html#` + encodeURIComponent(file.path));
                captureWindow.webContents.on('did-finish-load', () => {
                    captureWindow.show();
                    captureWindow.focus();
                    resolve(captureWindow);
                });
            });
        };
        if(screenSources === 'all') {
            let displays = Screen.getAllDisplays();
            screenSources = displays.map(display => {
                display.sourceId = display.id;
                return display;
            });
        }
        if(!Array.isArray(screenSources)) {
            screenSources = [screenSources];
        }
        hideCurrentWindow = hideCurrentWindow && this.browserWindow.isVisible();
        return new Promise((resolve, reject) => {
            let captureScreenWindows = [];
            Event.ipc.once(EVENT.capture_screen, (e, image) => {
                if(captureScreenWindows) {
                    captureScreenWindows.forEach(captureWindow => {
                        captureWindow.close();
                    });
                }
                if(hideCurrentWindow) {
                    this.browserWindow.show();
                    this.browserWindow.focus();
                }
                if(image) {
                    let filePath = this.user.makeFilePath(UUID.v4() + '.png');
                    Helper.saveImage(image.data, filePath).then(image => {
                        if(image && image.path) {
                            clipboard.writeImage(NativeImage.createFromPath(image.path));
                        }
                        resolve(image);
                    }).catch(reject);
                } else {
                    if(DEBUG) console.log('No capture image.');
                }
            });
            let takeScreenshots = () => {
                return Promise.all(screenSources.map(screenSource => {
                    return this.captureScreen(screenSource, '').then(file => {
                        return openCaptureScreenWindow(file, screenSource).then(captureWindow => {
                            captureScreenWindows.push(captureWindow);
                        });
                    });
                }));
            };
            if(hideCurrentWindow) {
                this.browserWindow.hide();
                setTimeout(() => {
                    takeScreenshots();
                }, Helper.isWindowsOS ? 600 : 0);
            } else {
                takeScreenshots();
            }
        });
        return this.captureScreen({sourceId: screenSource}, '', hideCurrentWindow).then(file => {
            return new Promise((resolve, reject) => {
                let captureWindow = new BrowserWindow({
                    x: 0,
                    y: 0,
                    width: screen.width,
                    height: screen.height,
                    alwaysOnTop: !DEBUG,
                    fullscreen: true,
                    frame: true,
                    show: false,
                    title: Lang.chat.captureScreen,
                    titleBarStyle: 'hidden',
                    resizable: false,
                });

                if (DEBUG) {
                    captureWindow.openDevTools();
                }
                captureWindow.loadURL(`file://${this.appRoot}/capture-screen.html#` + encodeURIComponent(file.path));
                captureWindow.webContents.on('did-finish-load', () => {
                    captureWindow.show();
                    captureWindow.focus();
                });
            })
        });
    }

    /**
     * Register global hotkey
     * @param  {object} option
     * @param  {string} name
     * @return {void}
     */
    registerGlobalShortcut(name, accelerator, callback) {
        if(!this.shortcuts) {
            this.shortcuts = {};
        }
        this.unregisterGlobalShortcut(name);
        this.shortcuts[name] = accelerator;
        GlobalShortcut.register(accelerator, () => {
            if(DEBUG) console.log("%cGLOBAL KEY ACTIVE " + name + ': ' + accelerator, 'display: inline-block; font-size: 10px; color: #fff; border: 1px solid #673AB7; padding: 1px 5px; border-radius: 2px; background: #673AB7');
            callback();
        });
        if(DEBUG) console.log("%cGLOBAL KEY BIND " + name + ': ' + accelerator, 'display: inline-block; font-size: 10px; color: #673AB7; border: 1px solid #673AB7; padding: 1px 5px; border-radius: 2px');
    }

    /**
     * Check a shortcu whether is registered
     */
    isGlobalShortcutRegistered(accelerator) {
        return GlobalShortcut.isRegistered(accelerator);
    }

    /**
     * Unregister global hotkey
     * @param  {gui.Shortcut | string | object} hotkey
     * @return {void}
     */
    unregisterGlobalShortcut(name) {
        if(this.shortcuts && this.shortcuts[name]) {
            GlobalShortcut.unregister(this.shortcuts[name]);
            delete this.shortcuts[name];
        }
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

    getDesktopCaptureSources(options, callback) {
        desktopCapturer.getSources(options, callback);
    }

    getPrimaryDisplay() {
        return Screen.getPrimaryDisplay();
    }

    getAllDisplays() {
        return Screen.getAllDisplays();
    }

    createImageFromPath(path) {
        return NativeImage.createFromPath(path);
    }

    getImageFromClipboard() {
        clipboard.readImage();
    }

    copyImageToClipboard(image) {
        clipboard.saveImage(image);
    }

    openFileItem(file) {
        shell.openItem(file);
    }

    showItemInFolder(file) {
        shell.showItemInFolder(file);
    }
}

const app = new App();

global.App = app;
const config = app.config;

export {config as Config, app as App, Lang}
export default app;
