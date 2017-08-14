import electron, {
    app as ElectronApp,
}                   from 'electron';
import DEBUG        from './utils/debug';
import application  from './platform/electron/app-remote';
import PKG          from './package.json';
import Lang         from './resource/lang';

application.init(__dirname);

let mainWindow = null;

if(process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support'); // eslint-disable-line
    sourceMapSupport.install();
}

if(DEBUG && DEBUG !== 'production') {
    require('electron-debug')(); // eslint-disable-line global-require
    const path = require('path'); // eslint-disable-line
    const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
    require('module').globalPaths.push(p); // eslint-disable-line
}

// Quit when all windows are closed.
ElectronApp.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') ElectronApp.quit();
});

const installExtensions = async() => {
    if (DEBUG && DEBUG === 'debug') {
        const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

        const extensions = [
            'REACT_DEVELOPER_TOOLS',
            'REDUX_DEVTOOLS'
        ];
        const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
        for (const name of extensions) { // eslint-disable-line
            try {
                await installer.default(installer[name], forceDownload);
            } catch (e) {} // eslint-disable-line
        }
    }
};

const createWindow = () => {
    mainWindow = application.createMainWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
ElectronApp.on('ready', async() => {
    await installExtensions();
    createWindow();
    if(DEBUG) console.info('\n>> Electron app ready.');
});

ElectronApp.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!mainWindow) {
        createWindow();
    } else if(!mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.focus();
    }
    if(DEBUG) console.info('\n>> Electron app activate.');
});

if(typeof ElectronApp.setAboutPanelOptions === 'function') {
    ElectronApp.setAboutPanelOptions({
        applicationName: Lang.title,
        applicationVersion: PKG.version,
        copyright: 'Copyright (C) 2017 cnezsoft.com',
        credits: 'Licence: ' + PKG.license,
        version: DEBUG ? '[debug]' : ''
    });
}

if(DEBUG) {
    global.mainWindow = mainWindow;
    console.info('\n>> Electron main process finish.');
}
