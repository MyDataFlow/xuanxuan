import Events from '../events';
import User from './user';
import Platform from 'Platform';
import Lang from '../../lang';
import timeSequence from '../../utils/time-sequence';
import notice from '../notice';

const EVENT = {
    swap: 'profile.user.swap',
};

let user = null;

const createUser = userData => {
    if(!(userData instanceof User)) {
        const user = new User(userData);
        user.$set(Object.assign({}, Platform.config.getUser(user.identify), userData));
        if(userData.password) {
            user.password = userData.password;
        }
        return user;
    } else {
        return userData;
    }
};

const setUser = newUser => {
    if(!(newUser instanceof User)) {
        throw new Error('Cannot set user for profile, because the user param is not User instance.');
    }

    let oldUser = user;
    if(oldUser) {
        oldUser.destroy();
    }
    user = newUser;
    user.enableEvents();

    if(DEBUG) {
        console.collapse('Profile.setUser', 'tealBg', user.identify, 'tealPale');
        console.log('user', user);
        console.groupEnd();
    }
    if(!oldUser || oldUser.identify !== user.identify) {
        notice.update();
        Events.emit(EVENT.swap, user);
    }
    return user;
};

const onSwapUser = listener => {
    return Events.on(EVENT.swap, listener);
};

const onUserStatusChange = listener => {
    return Events.on(User.EVENT.status_change, listener);
};

const onUserConfigChange = listener => {
    return Events.on(User.EVENT.config_change, listener);
};

const getLastSavedUser = () => {
    return Platform.config.getUser();
};

export default {
    EVENT,
    createUser,
    setUser,
    onSwapUser,
    onUserStatusChange,
    onUserConfigChange,
    getLastSavedUser,

    get user() {
        return user;
    },

    get userId() {
        return user && user.id;
    },

    get isUserOnline() {
        return user && user.isOnline;
    },

    get isUserVertified() {
        return user && user.isVertified;
    },

    get userStatus() {
        return user && user.status;
    },

    get summaryText() {
        if(user) {
            return `${user.displayName} [${Lang.string('member.status.' + user.statusName)}]`;
        }
        return '';
    },

    get userConfig() {
        return user ? user.config : {};
    },

    get userAccount() {
        return user ? user.account : {};
    },
};
