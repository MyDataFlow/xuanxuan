import Platform from 'Platform';
import Server from './server';
import Events from './events';

const EVENT = {
    app_link: 'app.link',
};

if(Platform.ui.quit) {
    Platform.ui.onRequestQuit(() => {
        Server.logout();
        // return false; // cancel quit;
    });
}

const onAppLinkClick = (type, listener) => {
    return Events.on(`${EVENT.app_link}.${type}`, listener);
};

const emitAppLinkClick = (type, target) => {
    return Events.emit(`${EVENT.app_link}.${type}`, target);
};

export default {
    isWindowsOS: Platform.env && Platform.env.isWindowsOS !== undefined ? Platform.env.isWindowsOS : window.navigator.userAgent.includes('Windows'),
    isOSX: Platform.env && Platform.env.isOSX !== undefined ? Platform.env.isOSX : window.navigator.userAgent.includes('Mac OS'),

    onAppLinkClick,
    emitAppLinkClick,
};
