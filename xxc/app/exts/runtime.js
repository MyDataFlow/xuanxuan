import Xext from './external-api';
import Exts from './exts';
import ui from './ui';
import manager from './manager';
import App from '../core';
import {setExtensionUser} from './extension';
import {registerCommand, execute, createCommandObject} from '../core/commander';
import {fetchServerExtensions, detachServerExtensions, getEntryVisitUrl} from './server';

global.Xext = Xext;

const replaceViews = {};

// load exts modules
const loadModules = () => {
    Exts.forEach(ext => {
        if (ext.isDev) {
            const reloadExt = manager.reloadDevExtension(ext);
            if (reloadExt) {
                ext = reloadExt;
            }
        } else {
            ext.attach();
        }
        if (ext.hasReplaceViews) {
            Object.assign(replaceViews, ext.replaceViews);
        }
    });
};

App.ui.onReady(() => {
    Exts.forEach(ext => {
        ext.callModuleMethod('onReady', ext);
    });
});

// Listen events
App.server.onUserLogin((user, error) => {
    if (!error) {
        setExtensionUser(user);
        Exts.forEach(ext => {
            ext.callModuleMethod('onUserLogin', user);
        });
    }
    fetchServerExtensions(user);
});

App.server.onUserLoginout((user, code, reason, unexpected) => {
    setExtensionUser(null);
    Exts.forEach(ext => {
        ext.callModuleMethod('onUserLoginout', user, code, reason, unexpected);
    });
    detachServerExtensions(user);
});

App.profile.onUserStatusChange((status, oldStatus, user) => {
    Exts.forEach(ext => {
        ext.callModuleMethod('onUserStatusChange', status, oldStatus, user);
    });
});

App.im.server.onSendChatMessages((messages, chat) => {
    Exts.forEach(ext => {
        ext.callModuleMethod('onSendChatMessages', messages, chat, App.profile.user);
    });
});

App.im.server.onReceiveChatMessages((messages) => {
    Exts.forEach(ext => {
        ext.callModuleMethod('onReceiveChatMessages', messages, App.profile.user);
    });
});

App.im.ui.onRenderChatMessageContent(content => {
    Exts.forEach(ext => {
        const result = ext.callModuleMethod('onRenderChatMessageContent', content);
        if (result !== undefined) {
            content = result;
        }
    });
    return content;
});

// Register 'extension' command
registerCommand('extension', (context, extName, commandName, ...params) => {
    const ext = Exts.getExt(extName);
    if (ext) {
        const command = ext.getCommand(commandName);
        if (command) {
            return execute(createCommandObject(command, null, {extension: ext}), ...params);
        } else if (DEBUG) {
            console.collapse('Command.execute.extension', 'redBg', commandName, 'redPale', 'command not found', 'redBg');
            console.log('ext', ext);
            console.log('params', params);
            console.log('context', context);
            console.groupEnd();
        }
    } else if (DEBUG) {
        console.collapse('Command.execute.extension', 'redBg', commandName, 'redPale', 'extension not found', 'redBg');
        console.log('extName', extName);
        console.log('params', params);
        console.log('context', context);
        console.groupEnd();
    }
});

registerCommand('showExtensionDialog', (context, extName) => {
    const ext = Exts.getExt(extName);
    if (ext) {
        return ui.showExtensionDetailDialog(ext);
    }
});

registerCommand('openInApp', (context, appName, url) => {
    ui.openAppWithUrl(appName, url);
});

const getUrlInspector = (url, type = 'inspect') => {
    let urlInspector = null;
    if (Exts.exts.some(x => {
        if (!x.disabled) {
            const xInspector = x.getUrlInspector(url, type);
            if (xInspector) {
                urlInspector = xInspector;
                return true;
            }
        }
        return false;
    })) {
        return urlInspector;
    }
};

const getUrlOpener = url => {
    return getUrlInspector(url, 'open');
};

// Set replaceViews to global
global.replaceViews = replaceViews;

export default {
    loadModules,
    ui,
    getUrlInspector,
    getUrlOpener,
    exts: Exts,
    getEntryVisitUrl
};
