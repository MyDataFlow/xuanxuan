import Platform from 'Platform'; // eslint-disable-line
import Config from 'Config'; // eslint-disable-line
import Server from './server';
import MemberProfileDialog from '../views/common/member-profile-dialog';
import Messager from '../components/messager';
import ContextMenu from '../components/context-menu';
import modal from '../components/modal';
import {isWebUrl, getSearchParam} from '../utils/html-helper';
import Lang from '../lang';
import Events from './events';
import profile from './profile';
import Notice from './notice';
import ImageViewer from '../components/image-viewer';
import Store from '../utils/store';
import {executeCommand, registerCommand} from './commander';
import WebViewDialog from '../views/common/webview-dialog';
import {addContextMenuCreator} from './context-menu';

const EVENT = {
    app_link: 'app.link',
    net_online: 'app.net.online',
    net_offline: 'app.net.offline',
    ready: 'app.ready'
};

addContextMenuCreator('image', ({url, dataType}) => {
    const items = [{
        label: Lang.string('menu.image.view'),
        click: () => {
            ImageViewer.show(url);
        }
    }];
    if (Platform.clipboard && Platform.clipboard.writeImageFromUrl) {
        items.push({
            label: Lang.string('menu.image.copy'),
            click: () => {
                Platform.clipboard.writeImageFromUrl(url, dataType);
            }
        });
    }
    if (Platform.dialog && Platform.dialog.saveAsImageFromUrl) {
        items.push({
            label: Lang.string('menu.image.saveAs'),
            click: () => {
                if (url.startsWith('file://')) {
                    url = url.substr(7);
                }
                return Platform.dialog.saveAsImageFromUrl(url, dataType).then(filename => {
                    if (filename) {
                        Messager.show(Lang.format('file.fileSavedAt.format', filename), {
                            actions: Platform.ui.openFileItem ? [{
                                label: Lang.string('file.open'),
                                click: () => {
                                    Platform.ui.openFileItem(filename);
                                }
                            }, {
                                label: Lang.string('file.openFolder'),
                                click: () => {
                                    Platform.ui.showItemInFolder(filename);
                                }
                            }] : null
                        });
                    }
                });
            }
        });
    }
    if (Platform.ui.openFileItem && dataType !== 'base64') {
        items.push({
            label: Lang.string('menu.image.open'),
            click: () => {
                if (url.startsWith('file://')) {
                    url = url.substr(7);
                }
                Platform.ui.openFileItem(url);
            }
        });
    }

    return items;
});

addContextMenuCreator('member', ({member}) => {
    return [{
        label: Lang.string('member.profile.view'),
        click: () => {
            MemberProfileDialog.show(member);
        }
    }];
});

const onAppLinkClick = (type, listener) => {
    return Events.on(`${EVENT.app_link}.${type}`, listener);
};

const emitAppLinkClick = (element, type, target, ...params) => {
    return Events.emit(`${EVENT.app_link}.${type}`, target, element, ...params);
};

onAppLinkClick('Member', target => {
    MemberProfileDialog.show(target);
});

let clearCopyCodeTip = null;
if (Platform.clipboard && Platform.clipboard.writeText) {
    registerCommand('copyCode', context => {
        const element = context.targetElement;
        if (element) {
            if (clearCopyCodeTip) {
                clearTimeout(clearCopyCodeTip);
                clearCopyCodeTip = null;
            }
            const code = element.nextElementSibling.innerText;
            Platform.clipboard.writeText(code);
            element.setAttribute('data-hint', Lang.string('common.copied'));
            element.classList.add('hint--success');
            clearCopyCodeTip = setTimeout(() => {
                clearCopyCodeTip = null;
                element.setAttribute('data-hint', Lang.string('common.copyCode'));
                element.classList.remove('hint--success');
            }, 2000);
            return true;
        }
        return false;
    });
}

Server.onUserLogin((user, loginError) => {
    if (!loginError && user.isFirstSignedToday) {
        Messager.show(Lang.string('login.signed'), {
            type: 'success',
            icon: 'calendar-check',
            autoHide: true,
        });
    }
    if (typeof Pace !== 'undefined') {
        Pace.stop();
    }
});

Server.onUserLoginout((user, code, reason, unexpected) => {
    if (user) {
        let errorCode = null;
        if (reason === 'KICKOFF') {
            errorCode = 'KICKOFF';
        }
        if (errorCode) {
            Messager.show(Lang.error(errorCode), {
                type: 'danger',
                icon: 'alert',
                actions: [{
                    label: Lang.string('login.retry'),
                    click: () => {
                        Server.login(user);
                    }
                }]
            });
            if (Notice.requestAttention) {
                Notice.requestAttention();
            }
        }
    }
});

document.body.classList.add(`os-${Platform.env.os}`);

export const openUrlInApp = (url, appName) => {
    executeCommand(`openInApp/${appName}/${encodeURIComponent(appName)}`, {appName, url});
};

export const openUrlInDialog = (url, options, callback) => {
    options = Object.assign({url}, options);
    WebViewDialog.show(url, options, callback);
};

registerCommand('openUrlInDialog', (context, url) => {
    if (!url && context.options && context.options.url) {
        url = context.options.url;
    }
    const options = context.options;
    if (url) {
        openUrlInDialog(url, options);
        return true;
    }
    return false;
});

export const openUrlInBrowser = url => {
    return Platform.ui.openExternal(url);
};

registerCommand('openUrlInBrowser', (context, url) => {
    if (!url && context.options && context.options.url) {
        url = context.options.url;
    }
    if (url) {
        openUrlInBrowser(url);
        return true;
    }
    return false;
});

export const openUrl = (url, targetElement) => {
    if (isWebUrl(url)) {
        if (global.ExtsRuntime) {
            const extInspector = global.ExtsRuntime.getUrlOpener(url, targetElement);
            if (extInspector && extInspector) {
                const openResult = extInspector.open(url);
                if (openResult === true || openResult === false) {
                    return openResult;
                } else if (typeof openResult === 'string') {
                    if (isWebUrl(openResult)) {
                        return openUrlInBrowser(openResult);
                    }
                    return openUrl(openResult, targetElement);
                }
            }
        }
        openUrlInBrowser(url);
        return true;
    } else if (url[0] === '@') {
        const params = url.substr(1).split('/').map(decodeURIComponent);
        emitAppLinkClick(targetElement, ...params);
        return true;
    } else if (url[0] === '!') {
        executeCommand(url.substr(1), {targetElement});
        return true;
    }
};

document.addEventListener('click', e => {
    let target = e.target;
    while (target && !((target.classList && target.classList.contains('app-link')) || (target.tagName === 'A' && target.attributes.href))) {
        target = target.parentNode;
    }

    if (target && (target.tagName === 'A' || target.classList.contains('app-link')) && (target.attributes.href || target.attributes['data-url'])) {
        const link = (target.attributes['data-url'] || target.attributes.href).value;
        if (openUrl(link, target)) {
            e.preventDefault();
        }
    }
});

window.addEventListener('online', () => {
    if (profile.user) {
        if (!Server.socket.isLogging) {
            Server.login(profile.user);
        }
    }
});
window.addEventListener('offline', () => {
    if (profile.isUserOnline) {
        profile.user.markDisconnect();
        Server.socket.close(null, 'net_offline');
    }
});


let dragLeaveTask;
const completeDragNDrop = () => {
    document.body.classList.remove('drag-n-drop-over-in');
    setTimeout(() => {
        document.body.classList.remove('drag-n-drop-over');
    }, 350);
};

window.ondragover = e => {
    clearTimeout(dragLeaveTask);
    if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        document.body.classList.add('drag-n-drop-over');
        setTimeout(() => {
            document.body.classList.add('drag-n-drop-over-in');
        }, 10);
    }
    e.preventDefault();
    return false;
};
window.ondragleave = e => {
    clearTimeout(dragLeaveTask);
    dragLeaveTask = setTimeout(completeDragNDrop, 300);
    e.preventDefault();
    return false;
};
window.ondrop = e => {
    clearTimeout(dragLeaveTask);
    completeDragNDrop();
    if (DEBUG) {
        console.collapse('DRAG FILE', 'redBg', (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length ? e.dataTransfer.files[0].path : ''), 'redPale');
        console.log(e);
        console.groupEnd();
    }
    e.preventDefault();
    return false;
};


if (Platform.ui.onRequestQuit) {
    Platform.ui.onRequestQuit(closeReason => {
        if (closeReason !== 'quit') {
            const user = profile.user;
            if (user && !user.isUnverified) {
                const appCloseOption = user.config.appCloseOption;
                if (appCloseOption === 'minimize' || !Platform.ui.showQuitConfirmDialog) {
                    Platform.ui.hideWindow();
                    return false;
                } else if (appCloseOption !== 'close' && Platform.ui.showQuitConfirmDialog) {
                    Platform.ui.showQuitConfirmDialog((result, checked) => {
                        if (checked && result) {
                            user.config.appCloseOption = result;
                        }
                        if (result === 'close') {
                            Server.logout();
                        }
                        return result;
                    });
                    return false;
                }
            }
        }
        Server.logout();
    });
}

let quit = null;
if (Platform.ui.quit) {
    quit = (delay = 1000, ignoreListener = true) => {
        if (ignoreListener) {
            Server.logout();
        }
        Platform.ui.quit(delay, ignoreListener);
    };
}

if (Platform.ui.onWindowMinimize) {
    Platform.ui.onWindowMinimize(() => {
        const userConfig = profile.userConfig;
        if (userConfig && userConfig.removeFromTaskbarOnHide) {
            Platform.ui.setShowInTaskbar(false);
        }
    });
}

if (Platform.ui.onWindowBlur && Platform.ui.hideWindow) {
    Platform.ui.onWindowBlur(() => {
        const userConfig = profile.userConfig;
        if (userConfig && userConfig.hideWindowOnBlur) {
            Platform.ui.hideWindow();
        }
    });
}

const reloadWindow = () => {
    return modal.confirm(Lang.string('dialog.reloadWindowConfirmTip'), {title: Lang.string('dialog.reloadWindowConfirm')}).then(confirmed => {
        if (confirmed) {
            Server.logout();
            setTimeout(() => {
                Store.set('autoLoginNextTime', true);
                if (Platform.ui.reloadWindow) {
                    Platform.ui.reloadWindow();
                } else {
                    window.location.reload();
                }
            }, 1000);
        }
        return Promise.resolve(confirm);
    });
};

export const isAutoLoginNextTime = () => {
    const autoLoginNextTime = Store.get('autoLoginNextTime');
    if (autoLoginNextTime) {
        Store.remove('autoLoginNextTime');
    }
    return autoLoginNextTime;
};

// Decode url params
const entryParams = getSearchParam();

export const triggerReady = () => {
    Events.emit(EVENT.ready);
};

export const onReady = listener => {
    return Events.on(EVENT.ready, listener);
};

const setTitle = title => {
    document.title = title;
};

setTitle(Lang.string('app.title'));

const urlMetaCaches = {};
const maxUrlCacheSize = 20;
export const getUrlMeta = (url, disableCache = false) => {
    if (!disableCache) {
        const urlMetaCache = urlMetaCaches[url];
        if (urlMetaCache) {
            return Promise.resolve(urlMetaCache.meta);
        }
    }
    if (Platform.ui.getUrlMeta) {
        let extInspector = null;
        if (global.ExtsRuntime) {
            extInspector = global.ExtsRuntime.getUrlInspector(url);
        }
        const getUrl = () => {
            if (extInspector && extInspector.getUrl) {
                const urlResult = extInspector.getUrl(url);
                if (urlResult instanceof Promise) {
                    return urlResult;
                }
                return Promise.resolve(urlResult);
            }
            return Promise.resolve(url);
        };
        if (extInspector && extInspector.noMeta && extInspector.inspect) {
            return getUrl().then(url => {
                const cardMeta = extInspector.inspect(url);
                if (cardMeta instanceof Promise) {
                    return cardMeta;
                }
                return Promise.resolve(cardMeta);
            });
        }
        return getUrl().then(Platform.ui.getUrlMeta).then(meta => {
            const {favicons} = meta;
            let cardMeta = {
                url,
                title: meta.title,
                subtitle: meta.title ? url : null,
                image: meta.image,
                content: meta.description && meta.description.length > 200 ? `${meta.description.substring(0, 150)}...` : meta.description,
                icon: favicons && favicons.length ? favicons[0].href : null
            };
            if (extInspector && extInspector.inspect) {
                try {
                    cardMeta = extInspector.inspect(meta, cardMeta, url);
                } catch (err) {
                    if (DEBUG) {
                        console.error('Inspect url error', {
                            err,
                            meta,
                            cardMeta,
                            extInspector
                        });
                    }
                }
                if (cardMeta instanceof Promise) {
                    return cardMeta.then(cardMeta => {
                        cardMeta.provider = extInspector.provider;
                        return Promise.resolve(cardMeta);
                    });
                } else if (cardMeta) {
                    cardMeta.provider = extInspector.provider;
                    return Promise.resolve(cardMeta);
                }
            }
            if (!cardMeta.title) {
                const contentType = meta.response.headers['content-type'];
                cardMeta.originContenttype = contentType;
                if (contentType.startsWith('image')) {
                    cardMeta.contentUrl = url;
                    cardMeta.contentType = 'image';
                    cardMeta.icon = 'mdi-image text-green icon-2x';
                } else if (contentType.startsWith('video')) {
                    cardMeta.contentUrl = url;
                    cardMeta.contentType = 'video';
                    cardMeta.clickable = 'title';
                    cardMeta.icon = 'mdi-video text-red icon-2x';
                }
                cardMeta.title = url;
            }

            // Save cache
            let cacheKeys = Object.keys(urlMetaCaches);
            if (cacheKeys.length > maxUrlCacheSize) {
                cacheKeys = cacheKeys.sort((x, y) => {
                    return x.time - y.time;
                });
                for (let i = 0; i < (cacheKeys.length - maxUrlCacheSize); ++i) {
                    delete urlMetaCaches[cacheKeys[i]];
                }
            }
            urlMetaCaches[url] = {meta: cardMeta, time: new Date().getTime()};

            return Promise.resolve(cardMeta);
        });
    }
    return Promise.resolve({url, title: url});
};

let isGlobalShortcutDisabled = false;

let globalHotkeys = null;
const registerShortcut = (loginUser, loginError) => {
    if (!Platform.shortcut) {
        return;
    }
    if (loginError) {
        return;
    }
    const userConfig = profile.userConfig;
    if (userConfig) {
        globalHotkeys = userConfig.globalHotkeys;
        Object.keys(globalHotkeys).forEach(name => {
            Platform.shortcut.registerGlobalShortcut(name, globalHotkeys[name], () => {
                if (!isGlobalShortcutDisabled) {
                    executeCommand(`shortcut.${name}`);
                } else if (DEBUG) {
                    console.log(`Global shortcut command '${name}' skiped.`);
                }
            });
        });
    }
};
const unregisterGlobalShortcut = () => {
    if (!Platform.shortcut) {
        return;
    }
    if (globalHotkeys) {
        Object.keys(globalHotkeys).forEach(name => {
            Platform.shortcut.unregisterGlobalShortcut(name);
        });
        globalHotkeys = null;
    }
};
if (Platform.shortcut) {
    profile.onUserConfigChange((change, config) => {
        if (change && Object.keys(change).some(x => x.startsWith('shortcut.'))) {
            registerShortcut();
        }
        if (config.needSave) {
            Server.socket.uploadUserSettings();
        }
    });
    Server.onUserLogin(registerShortcut);
    Server.onUserLoginout(unregisterGlobalShortcut);

    if (Platform.ui.showAndFocusWindow) {
        registerCommand('shortcut.focusWindowHotkey', () => {
            if (Platform.ui.hideWindow && Platform.ui.isWindowOpenAndFocus) {
                Platform.ui.hideWindow();
            } else {
                Platform.ui.showAndFocusWindow();
            }
        });
    }
}

export const isSmallScreen = () => { 
    return window.innerWidth < 768;
};

export const showMobileChatsMenu = (toggle) => {
    if (!isSmallScreen()) {
        return;
    }
    const {classList} = document.body;
    if (toggle === true) {
        classList.add('app-show-chats-menu');
    } else if (toggle === false) {
        classList.remove('app-show-chats-menu');
    } else {
        classList.toggle('app-show-chats-menu');
    }
};

export const disableGlobalShortcut = (disabled = true) => {
    isGlobalShortcutDisabled = disabled;
    unregisterGlobalShortcut();
};

export const enableGlobalShortcut = () => {
    isGlobalShortcutDisabled = false;
    registerShortcut();
};

export default {
    entryParams,
    get canQuit() {
        return !!Platform.ui.quit;
    },
    isSmallScreen,
    showMobileChatsMenu,
    disableGlobalShortcut,
    enableGlobalShortcut,
    onAppLinkClick,
    emitAppLinkClick,
    quit,
    showMessger: Messager.show,
    showContextMenu: ContextMenu.show,
    modal,
    reloadWindow,
    triggerReady,
    onReady,
    isAutoLoginNextTime,
    openUrl,
    getUrlMeta,
    openUrlInDialog,
    openUrlInBrowser,
    openUrlInApp
};
