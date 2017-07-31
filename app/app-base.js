import 'ion-sound';
import Path               from 'path';
import React              from 'react';
import ReactDOM           from 'react-dom';
import Events             from 'Events';
import Config             from 'Config';
import Helper             from 'Utils/helper';
import R, {EVENT}         from 'Resource';
import User, {USER_STATUS}from 'Models/user';
import ReadyNotifier      from 'Models/ready-notifier';
import API                from 'Models/api';
import Socket             from 'Models/socket';
import DAO                from 'Models/dao';
import {ChatApp}          from 'Models/apps';
import AboutView          from 'Views/misc/about';
import ContactView        from 'Views/contacts/contact';
import ConfirmCloseWindow from 'Views/windows/confirm-close-window';
import Modal              from 'Components/modal';
import ImageView          from 'Components/image-view';
import Lang               from 'Lang';
import Theme              from 'Theme';
import UserSettingView    from 'Views/user-settings';

/**
 * Application
 *
 * Only for renderer process
 */
class AppBase extends ReadyNotifier {

    /**
     * Application constructor
     */
    constructor() {
        super();

        this.event         = Events;
        this.config        = Config;
        this.lang          = Lang;

        this.config.ready(() => {
            this.resetUser(this.config.user);
            this._checkReady();
        });

        this.config.load(this.userDataPath);

        this.$ = {
            chat: new ChatApp(this)
        };

        Object.keys(this.$).forEach(appName => {
            return this[appName] = this.$[appName];
        });

        this._initEvents();

        if(window.ion) {
            window.ion.sound({
                sounds: [
                    {name: 'message'}
                ],
                multiplay: true,
                volume: 1,
                path: this.config.soundPath,
                preload: true,
            });
            if(DEBUG) {
                console.groupCollapsed('%cSOUND inited', 'display: inline-block; font-size: 10px; color: #689F38; background: #CCFF90; border: 1px solid #CCFF90; padding: 1px 5px; border-radius: 2px;');
                console.log('ion', window.ion);
                console.groupEnd();
            }
        }
    }

    makeLocalFileUrl(url) {
        return url;
    }

    get browserWindow() {
        throw new Error('Application.browserWindow getter should be implement in sub class.');
    }

    get desktopPath() {
        if(this._desktopPath !== undefined) {
            return this._desktopPath;
        }
        throw new Error('Application.desktopPath getter should be implement in sub class.');
    }

    get userDataPath() {
        throw new Error('Application.userDataPath getter should be implement in sub class.');
    }

    get appRoot() {
        if(this._appRoot !== undefined) {
            return this._appRoot;
        }
        throw new Error('Application.appRoot getter should be implement in sub class.');
    }

    _checkReady() {
        if(this.config && this.config.isReady) {
            this.ready();
        }
    }

    openExternal(path, options) {
        throw new Error('Application.openExternal(path, options) should be implement in sub class.');
    }

    requestAttention(attentions) {
        throw new Error('Application.requestAttention(attentions) should be implement in sub class.');
    }

    setShowInTaskbar(flag) {
        throw new Error('Application.setShowInTaskbar(flag) should be implement in sub class.');
    }

    /**
     * Initial function to init events
     * @return {void}
     */
    _initEvents() {
        this._isWindowFocus = true;
        this._isWindowMinimized = false;
        this._isWindowHide = false;

        this.on(R.event.ui_link, link => {
            if(link.action === 'URL') {
                this.openExternal(link.target)
            } else if(link.action === 'Member' && link.target) {
                let member = this.dao.getMember(link.target);
                if(member) {
                    Modal.show({
                        content: () => {
                            return <ContactView onSendBtnClick={() => {
                                Modal.hide();
                            }} member={member}/>;
                        },
                        width: 500,
                        actions: false
                    });
                }
            }
        });

        this.on(R.event.database_rebuild, dbVersion => {
            Modal.show({
                modal: true,
                closeButton: false,
                content: this.lang.main.databaseUpdateTip,
                width: 360,
                actions: [{type: 'cancel', label: this.lang.common.later}, {type: 'submit', label: this.lang.main.reload}],
                onSubmit: () => {
                    this.reloadApp();
                }
            });
        });

        this.on(R.event.socket_close, e => {
            this.user.changeStatus(this.user.isOnline ? USER_STATUS.disconnect : USER_STATUS.unverified, Lang.errors.SOCKET_CLOSE, 'socket_error');
        });
        this.on(R.event.socket_error, e => {
            this.user.changeStatus(this.user.isOnline ? USER_STATUS.disconnect : USER_STATUS.unverified, Lang.errors.SOCKET_ERROR, 'socket_error');
        });
        this.on(R.event.socket_timeout, e => {
            this.user.changeStatus(this.user.isOnline ? USER_STATUS.disconnect : USER_STATUS.unverified, Lang.errors.SOCKET_TIMEOUT, 'socket_error');
        });

        this.on(R.event.net_online, () => {
            if(this.user.isDisconnect) {
                this.emit(R.event.ui_messager, {
                    id: 'autoLoginingMessager',
                    clickAway: false,
                    autoHide: false,
                    content: Lang.login.autoLogining
                });
                this.login();
            }
        });

        this.on(R.event.net_offline, () => {
            if(this.user.isOnline) {
                this.user.changeStatus(USER_STATUS.disconnect, Lang.errors.NET_OFFLINE, 'net_offline');
                this.emit(R.event.ui_messager, {
                    id: 'netOfflineMessager',
                    clickAway: false,
                    autoHide: false,
                    content: Lang.errors.NET_OFFLINE,
                    color: Theme.color.negative
                });
            }
        });

        this.on(R.event.user_kickoff, e => {
            this.user.changeStatus(USER_STATUS.unverified, Lang.errors.KICKOFF, 'kickoff');
        });

        this.browserWindow.on('focus', () => {
            this._isWindowFocus = true;
            this.emit(R.event.ui_focus_main_window);
            this.requestAttention(false);
        });

        this.browserWindow.on('blur', () => {
            this._isWindowFocus = false;
            if(!this.user || this.user.isUnverified) {
                return;
            }
            if(this.user.getConfig('ui.app.hideWindowOnBlur')) {
                this.browserWindow.minimize();
            }
        });

        this.browserWindow.on('restore', () => {
            this._isWindowMinimized = false;
            if(!this.user || this.user.isUnverified) {
                return;
            }
            this.setShowInTaskbar(true);
            this.emit(R.event.ui_show_main_window);
        });

        this.browserWindow.on('minimize', () => {
            this._isWindowMinimized = true;
            if(!this.user || this.user.isUnverified) {
                return;
            }
            if(this.user.getConfig('ui.app.removeFromTaskbarOnHide')) {
                this.setShowInTaskbar(false);
            }
            this.emit(R.event.ui_show_main_window);
        });

        this.on(R.event.app_main_window_close, () => {
            if(!this.user || this.user.isUnverified) {
                this.quit();
                return;
            }
            let userCloseOption = this.user.getConfig('ui.app.onClose', 'ask');
            const handleCloseOption = option => {
                if(!option) option = userCloseOption;
                if(option === 'minimize') {
                    this.browserWindow.minimize();
                } else {
                    this.browserWindow.hide();
                    if(DEBUG) console.error('WINDOW CLOSE...');
                    this.quit();
                }
            };
            if(userCloseOption !== 'close' && userCloseOption !== 'minimize') {
                userCloseOption = '';
                Modal.show({
                    modal: true,
                    header: this.lang.main.askOnCloseWindow.title,
                    content: () => {
                        return <ConfirmCloseWindow onOptionChange={select => {
                            userCloseOption = select;
                        }}/>;
                    },
                    width: 400,
                    actions: [{type: 'cancel'}, {type: 'submit'}],
                    onSubmit: () => {
                        if(userCloseOption) {
                            if(userCloseOption.remember) {
                                this.user.setConfig('ui.app.onClose', userCloseOption.option);
                            }
                            handleCloseOption(userCloseOption.option);
                        }
                    }
                });
                this.showAndFocusWindow();
                this.requestAttention(1);
            } else {
                handleCloseOption(userCloseOption);
            }
        });

        this.on(R.event.app_quit, () => {
            this.quit();
        });

        this.on(R.event.user_config_change, (user) => {
            if(user.identify === this.user.identify) {
                this.delaySaveUser();
            }
        });
    }

    /**
     * Bind event
     * @param  {String} event
     * @param  {Function} listener
     * @return {Symbol}
     */
    on(event, listener) {
        return this.event.on(event, listener);
    }

    /**
     * Bind once event
     */
    once(event, listener) {
        return this.event.once(event, listener);
    }

    /**
     * Unbind event by name
     * @param  {...[Symbol]} names
     * @return {Void}
     */
    off(...names) {
        this.event.off(...names);
    }

    /**
     * Emit event
     */
    emit(names, ...args) {
        this.event.emit(names, ...args);
    }

    /**
     * Get current user
     */
    get user() {
        return this._user;
    }

    /**
     * Set current user
     */
    set user(user) {
        this.resetUser(user, true);
    }

    /**
     * Set current user with options
     */
    resetUser(user, saveConfig, notifyRemote) {
        const oldIdentify = this._user ? this._user.identify : null;

        if(!(user instanceof User)) {
            user = this.config.getUser(user);
        }
        if(this.saveUserTimerTask && this._user) {
            this.config.save(this._user);
        }

        user.listenStatus = true;
        this._user = user;

        if(oldIdentify !== user.identify) {
            this.badgeLabel = false;
            this.trayTooltip = false;
            this.emit(R.event.user_swap, user);
        }
        this.emit(EVENT.user_change, user);

        if(saveConfig) this.config.save(user);

        return user;
    }

    /**
     * Save user
     */
    saveUser(user) {
        if(user) {
            this.resetUser(user, true);
        } else {
            this.config.save(this.user);
        }
        if(this.saveUserTimerTask) {
            clearTimeout(this.saveUserTimerTask);
            this.saveUserTimerTask = null;
        }
    }

    /**
     * Delay save user config
     * @return {void}
     */
    delaySaveUser() {
        clearTimeout(this.saveUserTimerTask);
        this.saveUserTimerTask = null;
        if(this.user) {
            this.saveUserTimerTask = setTimeout(() => {
                this.saveUser();
            }, 5000);
        }
    }

    /**
     * Do user login action
     */
    login(user) {
        if(!user) user = this.user;
        if(!(user instanceof User)) {
            user = this.config.getUser(user);
        }
        if(user.isNewApi) {
            this.isUserLogining = true;
            this.emit(EVENT.user_login_begin, user);

            this.off(this._handleUserLoginFinishEvent);
            this._handleUserLoginFinishEvent = this.once(EVENT.user_login_message, (serverUser, error) => {
                this._handleUserLoginFinishEvent = false;
                this._handleUserLoginFinish(user, serverUser, error);
            });

            API.requestServerInfo(user).then(user => {
                if(this.socket) {
                    this.socket.destroy();
                }
                this.socket = new Socket(this, user);
                this.emit(EVENT.app_socket_change, this.socket);
            }).catch((err) => {
                err.oringeMessage = err.message;
                err.message = Lang.errors[err && err.code ? err.code : 'WRONG_CONNECT'] || err.message;
                if(DEBUG) console.error(err);
                this.emit(EVENT.user_login_message, null, err);
            });
        } else {
            return this.oldLogin(user);
        }
    }

    /**
     * Login with user for old version
     * @param  {object} user
     * @return {void}
     */
    oldLogin(user) {
        this.isUserLogining = true;
        this.emit(EVENT.user_login_begin, user);

        this.off(this._handleUserLoginFinishEvent);
        this._handleUserLoginFinishEvent = this.once(EVENT.user_login_message, (serverUser, error) => {
            this._handleUserLoginFinishEvent = false;
            this._handleUserLoginFinish(user, serverUser, error);
        });

        API.getZentaoConfig(user.serverUrlRoot).then(zentaoConfig => {
            user.zentaoConfig = zentaoConfig;
            if(this.socket) {
                this.socket.destroy();
            }
            this.socket = new Socket(this, user);
            this.emit(EVENT.app_socket_change, this.socket);
        }).catch(err => {
            err.oringeMessage = err.message;
            err.message = Lang.errors[err && err.code ? err.code : 'WRONG_CONNECT'] || err.message;
            if(DEBUG) console.error(err);
            this.emit(EVENT.user_login_message, null, err);
        });
    }

    /**
     * Make user data path
     * @return {boolean}
     */
    _makeUserDataPath(user) {
        user = user || this.user;
        let userDataPath = Path.join(this.userDataPath, 'users/' + user.identify);
        user.dataPath = userDataPath;
        return Helper.tryMkdirp(userDataPath).then(() => {
            return Helper.tryMkdirp(Path.join(userDataPath, 'temp/')).then(() => {
                return Helper.tryMkdirp(Path.join(userDataPath, 'images/')).then(() => {
                    return Helper.tryMkdirp(Path.join(userDataPath, 'files/'));
                });
            });
        });
    }

    /**
     * Handle user login with api data
     * @param  {User} user
     * @param  {Object} serverUser
     * @param  {Error} error
     * @return {Void}
     */
    _handleUserLoginFinish(user, serverUser, error) {
        if(serverUser) {
            // update user
            let serverStatus = serverUser.status;
            delete serverUser.status;
            const now = new Date();
            if(user.signed && (!user.lastLoginTime || (new Date(user.lastLoginTime)).toLocaleDateString() !== now.toLocaleDateString())) {
                setTimeout(() => {
                    this.emit(R.event.ui_messager, {
                        id: 'userSignedMessager',
                        clickAway: true,
                        autoHide: 2000,
                        content: Lang.login.todaySigned,
                        color: Theme.color.positive
                    });
                }, 2000);
            }
            user.lastLoginTime = now.getTime();
            user.assign(serverUser);
            user.fixAvatar();

            // init dao
            if(!this.dao || this.dao.dbName !== user.identify) {
                this.dao = new DAO(user, this);
            } else {
                this.dao.user = user;
            }

            // update socket
            this.socket.user = user;
            this.socket.dao = this.dao;

            // init user data path
            this._makeUserDataPath(user).then(() => {
                if(DEBUG) {
                    console.log('%cUSER DATA PATH ' + user.dataPath, 'display: inline-block; font-size: 10px; color: #009688; background: #A7FFEB; border: 1px solid #A7FFEB; padding: 1px 5px; border-radius: 2px;');
                }

                // set user status
                this.user = user;
                this.config.save(user);
                this.isUserLogining = false;
                this.user.changeStatus(serverStatus || 'online');
                setTimeout(() => {
                    this.emit(R.event.user_login_finish, {user: user, result: true});
                }, 2000);
            }).catch(err => {
                this.user = user;
                let error = new Error('Cant not init user data path.');
                error.code = 'USER_DATA_PATH_DENY';
                this.isUserLogining = false;
                this.emit(R.event.user_login_finish, {user: user, result: false, error});
                if(DEBUG) console.error(error);
            });
        } else {
            if(this.socket) {
                this.socket.destroy();
            }
            this.user = user;
            this.isUserLogining = false;
            this.emit(R.event.user_login_finish, {user: user, result: false, error});
        }
    }

    /**
     * Logout
     * @return {Void}
     */
    logout() {
        if(this.user) {
            if(this.user.isOnline) {
                this.config.save(this.user, true);
                if(this.socket) {
                    this.socket.uploadUserSettings(this.user);
                    this.socket.logout(this.user);
                }
            }
            this.user.changeStatus(USER_STATUS.unverified);
        }
        this.dao = null;
    }

    /**
     * Chnage user status
     * @param  {String} status
     * @return {Void}
     */
    changeUserStatus(status) {
        if(status !== 'offline') {
            this.socket.changeUserStatus(status);
        } else {
            this.logout();
        }
    }

    /**
     * Play soudn
     * @param  {string} sound name
     * @return {void}
     */
    playSound(sound) {
        // determine play sound by user config
        window.ion.sound.play(sound);
    }

    /**
     * Preview file
     */
    previewFile(path, displayName) {
        if(Help.isOSX) {
            this.browserWindow.previewFile(path, displayName);
        } else {
            // TODO: preview file on windows
        }
    }

    /**
     * Set current badage label
     * @param  {string | false} label
     * @return {void}
     */
    set badgeLabel(label = '') {
        if(DEBUG) {
            console.error('Application.setShowInTaskbar(flag) should be implement in sub class.');
        }
    }

    showWindow() {
        this.browserWindow.show();
        this._isWindowHide = false;
    }

    hideWindow() {
        this.browserWindow.hide();
        this._isWindowHide = true;
    }

    focusWindow() {
        this.browserWindow.focus();
    }

    /**
     * Show and focus main window
     * @return {void}
     */
    showAndFocusWindow() {
        this.showWindow();
        this.focusWindow();
    }

    get isWindowsFocus() {
        return this._isWindowFocus;
    }

    /**
     * Check whether the main window is open and focus
     * @return {boolean}
     */
    get isWindowOpenAndFocus() {
        return this.isWindowsFocus && this.isWindowOpen;
    }

    /**
     * Check whether the main window is open
     */
    get isWindowOpen() {
        return !this._isWindowMinimized && !this._isWindowHide;
    }

    /**
     * Set tooltip text on tray icon
     * @param  {string | false} tooltip
     * @return {void}
     */
    set trayTooltip(tooltip) {
        throw new Error('Application.trayTooltip setter should be implement in sub class.');
    }

    /**
     * Flash tray icon
     * @param  {boolean} flash
     * @return {void}
     */
    flashTrayIcon(flash = true) {
        throw new Error('Application.flashTrayIcon(flash) should be implement in sub class.');
    }

    /**
     * Create context menu
     * @param  {Array[Object]} items
     * @return {Menu}
     */
    createContextMenu(menu) {
        throw new Error('Application.createContextMenu(menu) should be implement in sub class.');
    }

    /**
     * Popup context menu
     */
    popupContextMenu(menu, x, y) {
        throw new Error('Application.popupContextMenu(menu, x, y) should be implement in sub class.');
    }

    /**
     * Show save dialog
     * @param object   options
     */
    showSaveDialog(options, callback) {
        throw new Error('Application.showSaveDialog(options, callback) should be implement in sub class.');
    }

    /**
     * Show open dialog
     */
    showOpenDialog(options, callback) {
        throw new Error('Application.showOpenDialog(options, callback) should be implement in sub class.');
    }

    /**
     * Open dialog window
     * @param  {Object} options
     * @return {Promise}
     */
    openDialog(options) {
        Modal.show(options);
    }

    /**
     * Open member profile window
     * @param  {Object} options
     * @param  {Member} member
     * @return {Promise}
     */
    openProfile(options, member) {
        let title = null;
        member = member || (options ? options.member : null);
        if(!member) {
            member = this.user;
            title = this.lang.user.profile;
        }
        if(!member) return Promise.reject('Member is null.');

        options = Object.assign({
            content: () => {
                return <ContactView onSendBtnClick={() => {
                    Modal.hide();
                }} member={member}/>;
            },
            width: 500,
            actions: false
        }, options);
        Modal.show({
            content: () => {
                return <ContactView onSendBtnClick={() => {
                    Modal.hide();
                }} member={member}/>;
            },
            width: 500,
            actions: false
        });
    }

    openSettingDialog(options) {
        let userSettingView = null;
        Modal.show({
            header: this.lang.common.settings,
            content: () => {
                return <UserSettingView config={this.user.config} ref={e => userSettingView = e}/>;
            },
            width: 500,
            actions: [
                {type: 'submit'},
                {type: 'cancel'},
                {
                    type: 'secondary',
                    label: this.lang.common.restoreDefault,
                    click: () => {
                        userSettingView.resetConfig();
                    },
                    style: {float: Helper.isWindowsOS ? 'none' : 'left'}
                },
            ],
            actionsAlign: Helper.isWindowsOS ? 'left' : 'right',
            onSubmit: () => {
                if(userSettingView.configChanged) {
                    this.user.resetConfig(userSettingView.getConfig());
                }
            },
            modal: true
        });
    }

    /**
     * Open about window
     * @return {Promise}
     */
    openAbout() {
        Modal.show({
            header: this.lang.common.about,
            content: () => {
                return <AboutView/>;
            },
            width: 400,
            actions: null
        });
    }

    /**
     * Get all members
     * @return {Array[Member]}
     */
    get members() {
        return this.dao.getMembers(true);
    }

    /**
     * Change @user to html link tag
     * @param  {string} text
     * @param  {string} format
     * @return {string}
     */
    linkMembersInText(text, format = '<a class="link-app {className}" href="#Member/{id}">@{displayName}</a>') {
        if(text.indexOf('@') > -1) {
            this.dao.getMembers().forEach(m => {
                text = text.replace(new RegExp('@(' + m.account + '|' + m.realname + ')', 'g'), format.format({displayName: m.displayName, id: m.id, account: m.account, className: m.account === this.user.account ? 'at-me' : ''}));
            });
        }
        return text;
    }

    /**
     * change http://example.com to html link tag
     * @param  {string} text
     * @param  {string} format
     * @return {string}
     */
    linkHyperlinkInText(text, format = '<a href="{0}">{1}</a>') {
        let urlPattern = '\\b((?:[a-z][\\w\\-]+:(?:\\/{1,3}|[a-z0-9%])|www\\d{0,3}[.]|[a-z0-9.\\-]+[.][a-z]{2,4}\\/)(?:[^\\s()<>]|\\((?:[^\\s()<>]|(?:\\([^\\s()<>]+\\)))*\\))+(?:\\((?:[^\\s()<>]|(?:\\([^\\s()<>]+\\)))*\\)|[^\\s`!()\\[\\]{};:\'".,<>?«»“”‘’]))';
        return text.replace(new RegExp(urlPattern, 'ig'), url => {
            let colonIdx = url.indexOf(':');
            if(url.includes('://') || (colonIdx < 7 && colonIdx > 0)) {
                return format.format(url, url);
            }
            return format.format('http://' + url, url);
        });
    }

    openImagePreview(imagePath, callback) {
        Modal.show({
            content: () => {
                return <ImageView sourceImage={imagePath} />;
            },
            closeButtonStyle: {color: '#fff', fill: '#fff', background: 'rgba(0,0,0,0.2)'},
            fullscreen: true,
            clickThrough: true,
            transparent: true,
            actions: false,
            onHide: callback
        });
    }

    /**
     * Capture screenshot image and save to file
     *
     * @param string filePath optional
     */
    captureScreen(options, filePath, hideCurrentWindow, onlyBase64) {
        throw new Error('Application.captureScreen(options, filePath, hideCurrentWindow, onlyBase64) should be implement in sub class.');
    }

    /**
     * Open capture screen window
     */
    openCaptureScreen(screenSources = 0, hideCurrentWindow = false) {
        throw new Error('Application.openCaptureScreen(screenSources = 0, hideCurrentWindow = false) should be implement in sub class.');
    }

    /**
     * Upload file to server with zentao API
     * @param  {File} file
     * @param  {object} params
     * @return {Promise}
     */
    uploadFile(file, params) {
        return API.uploadFile(file, this.user, params);
    }

    /**
     * Download file from server with zentao API
     * @param  {File} file
     * @param  {function} onProgress
     * @return {Promise}
     */
    downloadFile(file, onProgress) {
        if(!file.path) file.path = this.user.tempPath + file.name;
        if(!file.url) file.url = this.createFileDownloadLink(file, this.user);
        return API.downloadFile(file, this.user, onProgress);
    }

    /**
     * Create file download link with zentao API
     * @param  {string} fileId
     * @return {string}
     */
    createFileDownloadLink(file) {
        return API.createFileDownloadLink(file, this.user);
    }

    /**
     * Register global hotkey
     * @param  {object} option
     * @param  {string} name
     * @return {void}
     */
    registerGlobalShortcut(name, accelerator, callback) {
        throw new Error('Application.registerGlobalShortcut(name, accelerator, callback) should be implement in sub class.');
    }

    /**
     * Check a shortcu whether is registered
     */
    isGlobalShortcutRegistered(accelerator) {
        throw new Error('Application.isGlobalShortcutRegistered(accelerator) should be implement in sub class.');
    }

    /**
     * Unregister global hotkey
     * @param  {gui.Shortcut | string | object} hotkey
     * @return {void}
     */
    unregisterGlobalShortcut(name) {
        throw new Error('Application.unregisterGlobalShortcut(name) should be implement in sub class.');
    }

    /**
     * Quit application
     */
    quit() {
        this.browserWindow.hide();
        this.logout();
        if(this.saveUserTimerTask) {
            this.saveUser();
        }
    }

    getDesktopCaptureSources(options, callback) {
        throw new Error('Application.getDesktopCaptureSources(options, callback) should be implement in sub class.');
    }

    getPrimaryDisplay() {
        throw new Error('Application.getPrimaryDisplay(options, callback) should be implement in sub class.');
    }

    getAllDisplays() {
        throw new Error('Application.getAllDisplays() should be implement in sub class.');
    }

    createImageFromPath(path) {
        throw new Error('Application.createImageFromPath(path) should be implement in sub class.');
    }

    getImageFromClipboard() {
        throw new Error('Application.getImageFromClipboard() should be implement in sub class.');
    }

    copyImageToClipboard(image) {
        throw new Error('Application.copyImageToClipboard(image) should be implement in sub class.');
    }

    openFileItem(file) {
        throw new Error('Application.openFileItem(file) should be implement in sub class.');
    }

    showItemInFolder(file) {
        throw new Error('Application.showItemInFolder(file) should be implement in sub class.');
    }
}

export default AppBase;
