import Platfrom, {Database} from 'Platform';
import profile from './user-profile';
import Socket from '../models/Socket';
import serverHandlers from './server-handlers';
import members from './members';
import im from './im';

class App {

    constructor() {
        const socket = new Socket();
        socket.setHandler(serverHandlers);
        profile.onSwapUser(user => {
            socket.close();
            members.init();
            im.init();
            if(this.db) {
                this.db.destroy();
            }
            this.db = Database.create(user.identify);
        });
        this.socket = socket;
    }

    get members() {
        return members;
    }

    get user() {
        return profile.user;
    }

    get profile() {
        return profile
    }

    login(user) {
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
    }
}

const app = new App();

if(DEBUG) {
    global.$.App = app;
}

export default app;
