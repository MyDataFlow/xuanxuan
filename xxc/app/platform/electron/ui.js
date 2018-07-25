import {
    shell,
    remote as Remote,
} from 'electron';
import uuid from 'uuid/v4';
import Path from 'path';
import remote from './remote';
import shortcut from './shortcut';
import Lang from '../../lang';
import env from './env';
import getUrlMeta from './get-url-meta';

if (DEBUG) {
    global.$.Remote = Remote;
}

const userDataPath = Remote.app.getPath('userData');
const browserWindow = Remote.getCurrentWindow();


let onRequestQuitListener = null;

const createUserDataPath = (user, fileName, dirName = 'images') => {
    return Path.join(userDataPath, 'users', user.identify, dirName, fileName);
};

const makeFileUrl = url => {
    return url;
};

const makeTmpFilePath = (ext = '') => {
    return Path.join(userDataPath, `tmp/${uuid()}${ext}`);
};

const setBadgeLabel = (label = '') => {
    return remote.call('dockBadgeLabel', `${label || ''}`);
};

const setShowInTaskbar = flag => {
    return browserWindow.setSkipTaskbar(!flag);
};

const setTrayTooltip = tooltip => {
    return remote.call('trayTooltip', tooltip);
};

const flashTrayIcon = (flash = true) => {
    return remote.call('flashTrayIcon', flash);
};

const showWindow = () => {
    browserWindow.show();
};

const hideWindow = () => {
    browserWindow.minimize();
};

const focusWindow = () => {
    browserWindow.focus();
};

const closeWindow = () => {
    browserWindow.close();
};

const showAndFocusWindow = () => {
    if (browserWindow.isMinimized()) {
        browserWindow.restore();
    } else {
        showWindow();
    }
    focusWindow();
};

const quitIM = () => {
    remote.call('quit');
};

const quit = (delay = 1000, ignoreListener = false) => {
    if (delay !== true && !ignoreListener && onRequestQuitListener) {
        if (onRequestQuitListener(delay) === false) {
            return;
        }
    }

    browserWindow.hide();
    shortcut.unregisterAll();

    if (delay && delay !== true) {
        setTimeout(quitIM, delay);
    } else {
        quitIM();
    }
};

const onRequestQuit = listener => {
    onRequestQuitListener = listener;
};

const onWindowFocus = listener => {
    browserWindow.on('focus', listener);
};

const onWindowBlur = listener => {
    browserWindow.on('blur', listener);
};

const onWindowMinimize = listener => {
    browserWindow.on('minimize', listener);
};

remote.onRequestQuit((sender, closeReason) => {
    quit(closeReason);
});

const showQuitConfirmDialog = (callback) => {
    Remote.dialog.showMessageBox(browserWindow, {
        type: 'question',
        message: Lang.string('dialog.appClose.title'),
        checkboxLabel: callback ? Lang.string('dialog.appClose.rememberOption') : undefined,
        checkboxChecked: false,
        cancelId: 2,
        defaultId: 0,
        buttons: [Lang.string('dialog.appClose.minimizeMainWindow'), Lang.string('dialog.appClose.quitApp'), Lang.string('dialog.appClose.cancelAction')],
    }, (result, checked) => {
        result = ['minimize', 'close', ''][result];
        if (callback) {
            result = callback(result, checked);
        }
        if (result === 'minimize') {
            hideWindow();
        } else if (result === 'close') {
            quit(true);
        }
    });
};

const openDevTools = () => {
    browserWindow.openDevTools();
    // todo: Turn on debug mode
};

const reloadWindow = () => {
    browserWindow.reload();
};

const isOpenAtLogin = () => {
    return Remote.app.getLoginItemSettings().openAtLogin;
};

const setOpenAtLogin = openAtLogin => {
    Remote.app.setLoginItemSettings({openAtLogin});
    // Fix disable openAtLogin not work in mac os, see https://github.com/electron/electron/issues/10880#issuecomment-356067655
    if (!openAtLogin && env.isOSX) {
        __non_webpack_require__('child_process').exec(`osascript -e 'tell application "System Events" to delete login item "${Remote.app.getName()}"'`);
    }
};

const copySelectText = () => {
    browserWindow.webContents.copy();
};

const selectAllText = () => {
    browserWindow.webContents.selectAll();
};

browserWindow.on('restore', () => {
    setShowInTaskbar(true);
});

const onWindowRestore = listener => {
    browserWindow.on('restore', listener);
};

export default {
    userDataPath,
    browserWindow,
    makeFileUrl,
    makeTmpFilePath,
    openExternal: shell.openExternal,
    showItemInFolder: shell.showItemInFolder,
    openFileItem: shell.openItem,
    setBadgeLabel,
    setShowInTaskbar,
    onWindowMinimize,
    setTrayTooltip,
    flashTrayIcon,
    onRequestQuit,
    onWindowFocus,
    closeWindow,
    openDevTools,
    onWindowBlur,
    onWindowRestore,

    showWindow,
    hideWindow,
    focusWindow,
    showAndFocusWindow,
    showQuitConfirmDialog,
    quit,
    reloadWindow,
    isOpenAtLogin,
    setOpenAtLogin,
    getUrlMeta,
    createUserDataPath,
    copySelectText,
    selectAllText,

    get isWindowFocus() {
        return browserWindow.isFocused();
    },

    get isWindowOpen() {
        return !browserWindow.isMinimized() && browserWindow.isVisible();
    },

    get isWindowOpenAndFocus() {
        return browserWindow.isFocused() && !browserWindow.isMinimized() && browserWindow.isVisible();
    },

    get appRoot() {
        return env.appRoot;
    },
};
