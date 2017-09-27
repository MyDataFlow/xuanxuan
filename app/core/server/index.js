import Socket from '../../network/socket';
import serverHandlers from './server-handlers';
import profile from '../profile';
import API from '../../network/api';
import notice from '../notice';
import Events from '../events';
import limitTimePromise from '../../utils/limit-time-promise';
import compareVersions from 'compare-versions';
import Config from 'Config';
import Platform from 'Platform';

const TIMEOUT = 20*1000;

const socket = new Socket();
socket.setHandler(serverHandlers);

const EVENT = {
    login: 'server.user.login',
    loginout: 'server.user.loginout',
}

profile.onSwapUser(user => {
    socket.close();
});

const checkServerVersion = serverVersion => {
    if(!serverVersion) {
        return 'SERVER_VERSION_UNKNOWN';
    }
    if(serverVersion[0].toLowerCase() === 'v') {
        serverVersion = serverVersion.substr(1);
    }
    if(compareVersions(serverVersion, '1.1.0') < 0) {
        const error = new Error('SERVER_VERSION_NOT_SUPPORT');
        error.formats = [Config.pkg.version, serverVersion, '1.1.0'];
        return error;
    }
    if(Platform.type === 'browser' && compareVersions(serverVersion, '1.2.0') < 0) {
        const error = new Error('SERVER_VERSION_NOT_SUPPORT_IN_BROWSER');
        error.formats = [Config.pkg.version, serverVersion, '1.2.0'];
        return error;
    }
    return false;
};

const login = (user) => {
    user = profile.createUser(user);

    if(user) {
        user = profile.setUser(user);
    } else {
        user = profile.user;
    }
    if(DEBUG) {
        console.collapse('Server.login', 'tealBg', user.identify, 'tealPale');
        console.log('user', user);
        console.groupEnd();
    }
    if(!user) {
        let error = new Error('User is not set.');
        error.code = 'USER_INFO_REQUIRED';
        return Promise.reject(error);
    }
    if(user.isLogging) {
        let error = new Error('Last login request not finish, please wait a minute.');
        error.code = 'SERVER_IS_BUSY';
        return Promise.reject(error);
    }

    return limitTimePromise(API.requestServerInfo(user), TIMEOUT).then(user => {
        const versionError = checkServerVersion(user.serverVersion);
        if(versionError) {
            return Promise.reject(versionError);
        }
        return socket.login(user, {onClose: (socket, code, reason, unexpected) => {
            Events.emit(EVENT.loginout, user, code, reason, unexpected);
        }});
    }).then(user => {
        user.endLogin(true);
        user.save();
        Events.emit(EVENT.login, user);
        return Promise.resolve(user);
    }).catch(error => {
        user.endLogin(false);
        Events.emit(EVENT.login, false);
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

const logout = () => {
    notice.update();
    socket.logout();
    profile.user.markUnverified();
};

export default {
    login,
    logout,
    socket,
    onUserLogin,
    onUserLoginout,
    changeUserStatus
};
