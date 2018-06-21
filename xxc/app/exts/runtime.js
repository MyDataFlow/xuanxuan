import Xext from './external-api';
import Exts from './exts';
import ui from './ui';
import manager from './manager';
import App from '../core';
import {setExtensionUser} from './extension';
import {registerCommand, execute, createCommandObject} from '../core/commander';

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
});

App.server.onUserLoginout((user, code, reason, unexpected) => {
    setExtensionUser(null);
    Exts.forEach(ext => {
        ext.callModuleMethod('onUserLoginout', user, code, reason, unexpected);
    });
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

// Set replaceViews to global
global.replaceViews = replaceViews;

export default {
    loadModules,
    ui
};
