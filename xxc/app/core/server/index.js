import compareVersions from 'compare-versions';
import Platform from 'Platform';
import pkg from '../../package.json';
import Socket from '../../network/socket';
import serverHandlers from './server-handlers';
import profile from '../profile';
import API from '../../network/api';
import notice from '../notice';
import Events from '../events';
import limitTimePromise from '../../utils/limit-time-promise';

const TIMEOUT = 20 * 1000;

const socket = new Socket();
socket.setHandler(serverHandlers);

const EVENT = {
    login: 'server.user.login',
    loginout: 'server.user.loginout',
};

profile.onSwapUser(user => {
    socket.close();
});

const MIN_SUPPORT_VERSION = '1.2.0';

const checkServerVersion = serverVersion => {
    if (!serverVersion) {
        return 'SERVER_VERSION_UNKNOWN';
    }
    if (serverVersion[0].toLowerCase() === 'v') {
        serverVersion = serverVersion.substr(1);
    }
    if (compareVersions(serverVersion, MIN_SUPPORT_VERSION) < 0) {
        if (!DEBUG) {
            const error = new Error('SERVER_VERSION_NOT_SUPPORT');
            error.formats = [pkg.version, serverVersion, MIN_SUPPORT_VERSION];
            return error;
        }
        console.warn(`The server version '${serverVersion}' not support, require the min version '${MIN_SUPPORT_VERSION}'.`);
    }
    if (Platform.type === 'browser' && compareVersions(serverVersion, '1.2.0') < 0) {
        const error = new Error('SERVER_VERSION_NOT_SUPPORT_IN_BROWSER');
        error.formats = [pkg.version, serverVersion, '1.2.0'];
        return error;
    }
    return false;
};

const checkVersionSupport = user => {
    const {serverVersion, uploadFileSize} = user;
    const compareVersionValue = compareVersions(serverVersion, '1.3.0');
    const compareVersionValue2 = compareVersions(serverVersion, '1.4.0');
    const compareVersionValue3 = compareVersions(serverVersion, '1.6.0');
    return {
        messageOrder: compareVersionValue >= 0,
        userGetListWithId: compareVersionValue >= 0,
        wss: compareVersionValue > 0,
        fileServer: uploadFileSize !== 0,
        todo: compareVersionValue2 > 0,
        socketPing: compareVersionValue2 > 0,
        remoteExtension: compareVersions(serverVersion, '1.5.0') > 0,
        muteChat: compareVersionValue3 > 0,
        hideChat: compareVersionValue3 > 0,
    };
};

const login = (user) => {
    user = profile.createUser(user);

    if (user) {
        user = profile.setUser(user);
    } else {
        user = profile.user;
    }
    if (DEBUG) {
        console.collapse('Server.login', 'tealBg', user.identify, 'tealPale');
        console.log('user', user);
        console.groupEnd();
    }
    if (!user) {
        const error = new Error('User is not set.');
        error.code = 'USER_INFO_REQUIRED';
        return Promise.reject(error);
    }
    if (user.isLogging) {
        const error = new Error('Last login request not finish, please wait a minute.');
        error.code = 'SERVER_IS_BUSY';
        return Promise.reject(error);
    }

    user.beginLogin();
    return limitTimePromise(API.requestServerInfo(user), TIMEOUT).then(user => {
        const versionError = checkServerVersion(user.serverVersion);
        if (versionError) {
            return Promise.reject(versionError);
        }
        user.setVersionSupport(checkVersionSupport(user));
        return socket.login(user, {onClose: (socket, code, reason, unexpected) => {
            Events.emit(EVENT.loginout, user, code, reason, unexpected);
        }});
    }).then(user => {
        user.endLogin(true);
        Events.emit(EVENT.login, user);
        user.save();
        return Promise.resolve(user);
    }).catch(error => {
        user.endLogin(false);
        Events.emit(EVENT.login, user, error);
        return Promise.reject(error);
    });
};

const changeUserStatus = status => {
    return socket.changeUserStatus(status);
};

const onUserLogin = listener => {
    return Events.on(EVENT.login, listener);
};

const onUserLoginout = listener => {
    return Events.on(EVENT.loginout, listener);
};

const fetchUserList = (idList) => {
    return socket.sendAndListen({
        method: 'usergetlist',
        params: [idList || '']
    });
};

let tempUserIdList = null;
let lastGetTempUserCall = null;
const tryGetTempUserInfo = id => {
    if (!lastGetTempUserCall) {
        clearTimeout(lastGetTempUserCall);
    }
    if (tempUserIdList) {
        tempUserIdList.push(id);
    } else {
        tempUserIdList = [id];
    }
    lastGetTempUserCall = setTimeout(() => {
        if (tempUserIdList.length) {
            fetchUserList(tempUserIdList);
            tempUserIdList = [];
        }
        lastGetTempUserCall = null;
    }, 1000);
};

const logout = () => {
    notice.update();
    socket.logout();
    if (profile.user) {
        profile.user.markUnverified();
    }
};

const changeRanzhiUserPassword = (oldPassword, newPassword) => {
    return API.changeRanzhiUserPassword(profile.user, oldPassword, newPassword);
};

export default {
    login,
    logout,
    socket,
    onUserLogin,
    onUserLoginout,
    changeUserStatus,
    changeRanzhiUserPassword,
    fetchUserList,
    tryGetTempUserInfo
};
