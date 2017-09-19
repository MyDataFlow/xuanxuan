import Socket from '../../network/socket';
import serverHandlers from './server-handlers';
import profile from '../profile';
import API from '../../network/api';
import notice from '../notice';

const socket = new Socket();
socket.setHandler(serverHandlers);

profile.onSwapUser(user => {
    socket.close();
});

const login = user => {
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

    user.beginLogin();
    return API.requestServerInfo(user).then(user => {
        return socket.login(user);
    }).then(user => {
        user.endLogin(true);
        user.save();
        return Promise.resolve(user);
    }).catch(error => {
        user.endLogin(false);
        return Promise.reject(error);
    });
};

const changeUserStatus = status => {
    return socket.changeUserStatus(status);
};

const logout = () => {
    notice.update();
    socket.logout();
};

export default {
    login,
    logout,
    socket,
    changeUserStatus
};
