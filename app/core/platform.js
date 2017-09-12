import Platform from 'Platform';
import Server from './server';

const platform = {
    isWindowsOS: Platform.env && Platform.env.isWindowsOS !== undefined ? Platform.env.isWindowsOS : window.navigator.userAgent.includes('Windows'),
    isOSX: Platform.env && Platform.env.isOSX !== undefined ? Platform.env.isOSX : window.navigator.userAgent.includes('Mac OS'),
};

if(Platform.ui.quit) {
    platform.quit = Platform.ui.quit;
    Platform.ui.onRequestQuit(() => {
        Server.logout();

        // return false; // cancel quit;
    });
}

export default platform;
