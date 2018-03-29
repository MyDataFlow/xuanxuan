let osPlatform = null;

const userAgent = window.navigator.userAgent;
const isOSX = userAgent.includes('Mac OS');
const isWindowsOS = userAgent.includes('Windows');
const isLinux = userAgent.includes('Linux');
if (isOSX) {
    osPlatform = 'osx';
} else if (isWindowsOS) {
    osPlatform = 'windows';
} else if (isLinux) {
    osPlatform = 'linux';
}

export default {
    os: osPlatform,
    isWindowsOS,
    isOSX,
};
