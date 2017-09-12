import os from 'os';
import {remote as Remote} from 'electron';

const OS_PLATFORM = os.platform();
const dataPath = Remote.app.getPath('userData');
const desktopPath = Remote.app.getPath('desktop');
const isOSX = OS_PLATFORM === 'osx' || OS_PLATFORM === 'darwin';
const isWindowsOS = OS_PLATFORM === 'win32' || OS_PLATFORM === 'win64';

export default {
    os: isOSX ? 'mac' : isWindowsOS ? 'windows' : OS_PLATFORM,
    isWindowsOS,
    isOSX,
    dataPath,
    desktopPath
};
