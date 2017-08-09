import 'ion-sound';
import Path               from 'path';
import React              from 'react';
import ReactDOM           from 'react-dom';
import Events             from 'Events';
import Config             from 'Config';
import Helper             from 'Utils/helper';
import R, {EVENT}         from 'Resource';
import User, {USER_STATUS}from 'Models/user';
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
class AppBase {

    /**
     * Application constructor
     */
    constructor() {
        super();

        document.title = Lang.title;

        this.event         = Events;
        this.config        = Config;
        this.lang          = Lang;

        this.$ = {
            chat: new ChatApp(this)
        };

        Object.keys(this.$).forEach(appName => {
            return this[appName] = this.$[appName];
        });

        this._initEvents();
    }

    /**
     * Initial function to init events
     * @return {void}
     */
    _initEvents() {
        this._isWindowFocus = true;
        this._isWindowMinimized = false;
        this._isWindowHide = false;

        // prevent default behavior from changing page on dropped file
        let completeDragNDrop = () => {
            document.body.classList.remove('drag-n-drop-over-in');
            setTimeout(() => {
                document.body.classList.remove('drag-n-drop-over');
            }, 350);
        }
        window.ondragover = e => {
            clearTimeout(this.dragLeaveTask);
            if(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                document.body.classList.add('drag-n-drop-over');
                setTimeout(() => {
                    document.body.classList.add('drag-n-drop-over-in');
                }, 10);
            }
            e.preventDefault();
            return false;
        };
        window.ondragleave = e => {
            clearTimeout(this.dragLeaveTask);
            this.dragLeaveTask = setTimeout(completeDragNDrop, 300);
            e.preventDefault();
            return false;
        };
        window.ondrop = e => {
            clearTimeout(this.dragLeaveTask);
            completeDragNDrop();
            if(DEBUG) console.log('%cDRAG FILE ' + (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length ? e.dataTransfer.files[0].path : ''), 'display: inline-block; font-size: 13px; background: #03B8CF; color: #fff; padding: 2px 5px', Object.assign({}, e));
            e.preventDefault();
            return false;
        };
        window.addEventListener('online',  () => {
            EventCenter.emit(R.event.net_online);
            EventCenter.ipc.emit(R.event.net_online);
        });
        window.addEventListener('offline',  () => {
            EventCenter.emit(R.event.net_offline);
            EventCenter.ipc.emit(R.event.net_online);
        });

        document.addEventListener('click', e => {
            let target = e.target;
            while(target && !((target.classList && target.classList.contains('link-app')) || (target.tagName === 'A' && target.attributes['href']))) {
                target = target.parentNode;
            }
            if(target && ((target.classList && target.classList.contains('link-app')) || (target.tagName === 'A' && target.attributes['href']))) {
                let link = target.attributes['href'] || target.attributes['data-target'];
                if(link && link.value) {
                    App.emit(R.event.ui_link, new AppActionLink(link.value, e));
                }
                e.preventDefault();
            }
        });

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

        Events.on(R.event.ui_messager, (options, ...args) => {
            if(typeof option === 'string') {
                Messager[option].call(...args);
            } else {
                Messager.hide();
                Messager.show(options);
            }
        });
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
     * Quit application
     */
    quit() {
        this.browserWindow.hide();
        this.logout();
        if(this.saveUserTimerTask) {
            this.saveUser();
        }
    }
}

export default AppBase;
