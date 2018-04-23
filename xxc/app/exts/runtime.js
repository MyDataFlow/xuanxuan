import Xext from './external-api';
import Exts from './exts';
import manager from './manager';
import App from '../core';
import {Index as View} from '../views/exts';

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
        }

        if (ext.hasModule) {
            if (ext.lazy) {
                if (DEBUG) {
                    console.collapse('Extension Lazy load', 'greenBg', ext.name, 'greenPale');
                    console.log('extension', ext);
                    console.groupEnd();
                }
            } else {
                ext.loadModule(Xext);
            }

            if (ext.hasReplaceViews) {
                Object.assign(replaceViews, ext.replaceViews);
            }
        }
    });
};

// Listen events
App.server.onUserLogin((user, error) => {
    if (!error) {
        Exts.forEach(ext => {
            ext.callModuleMethod('onUserLogin', user);
        });
    }
});

App.server.onUserLoginout((user, code, reason, unexpected) => {
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

global.replaceViews = replaceViews;

export default {
    loadModules,
    View,
};
