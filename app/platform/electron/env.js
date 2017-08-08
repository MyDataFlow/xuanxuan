import os from 'os';
import {remote as Remote} from 'electron';

const OS_PLATFORM = os.platform();
const dataPath = Remote.app.getPath('userData');
const desktopPath = Remote.app.getPath('desktop');

export default {
    os: OS_PLATFORM,
    isWindowsOS: OS_PLATFORM === 'win32' || OS_PLATFORM === 'win64',
    isOSX: OS_PLATFORM === 'osx' || OS_PLATFORM === 'darwin',
    dataPath,
    desktopPath
};
