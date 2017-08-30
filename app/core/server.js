import Socket from '../models/Socket';
import serverHandlers from './server-handlers';
import profile from './user-profile';

const socket = new Socket();
socket.setHandler(serverHandlers);

profile.onSwapUser(user => {
    socket.close();
});

const login = user => {
    if(user) {
        profile.setUser(user);
    } else {
        user = this.user;
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
    return requestServerInfo(user).then(user => {
        return this.socket.login(user);
    }).then(user => {
        user.endLogin(true);
        return Promise.resolve(user);
    }).catch(error => {
        user.endLogin(false);
        return Promise.reject(error);
    });
};

export default {
    login
};
