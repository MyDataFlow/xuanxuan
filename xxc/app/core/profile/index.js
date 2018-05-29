import Platform from 'Platform';
import Events from '../events';
import UserConfig from './user-config';
import User from './user';
import Lang from '../../lang';
import notice from '../notice';

const EVENT = {
    swap: 'profile.user.swap',
};

let user = null;

const createUser = userData => {
    if (!(userData instanceof User)) {
        const newUser = new User(userData);
        newUser.$set(Object.assign({}, Platform.config.getUser(newUser.identify), userData));
        if (userData.password) {
            newUser.password = userData.password;
        }
        return newUser;
    }
    return userData;
};

const setUser = newUser => {
    if (!(newUser instanceof User)) {
        throw new Error('Cannot set user for profile, because the user param is not User instance.');
    }

    const oldUser = user;
    if (oldUser) {
        oldUser.destroy();
    }
    user = newUser;
    user.enableEvents();

    if (DEBUG) {
        console.collapse('Profile.setUser', 'tealBg', user.identify, 'tealPale');
        console.log('user', user);
        console.groupEnd();
    }
    if (!oldUser || oldUser.identify !== user.identify) {
        notice.update();
        Events.emit(EVENT.swap, user);
    }
    return user;
};

const onSwapUser = listener => (Events.on(EVENT.swap, listener));

const onUserStatusChange = listener => (Events.on(User.EVENT.status_change, listener));

const onUserConfigChange = listener => (Events.on(User.EVENT.config_change, listener));

const getLastSavedUser = () => (Platform.config.getUser());

export default {
    UserConfig,
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
        if (user) {
            return `${user.displayName} [${Lang.string(`member.status.${user.statusName}`)}]`;
        }
        return '';
    },

    get userConfig() {
        return user ? user.config : {};
    },

    get userAccount() {
        return user ? user.account : {};
    },

    isCurrentUser(theUser) {
        return theUser && user && user.id === theUser.id;
    },
};
