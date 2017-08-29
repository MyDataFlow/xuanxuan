import Events from './events';

const EVENT = {
    swap: 'user.swap',
};

let user = null;

const setUser = newUser => {
    if(!(newUser instanceof User)) {
        throw new Error(`The newUser param is not User class instance.`);
    }
    let oldUser = user;
    user = newUser;
    if(!oldUser || oldUser.identify !== user.identify) {
        Events.emit(EVENT.swap, user);
    }
};

const onSwapUser = listener => {
    return Events.on(EVENT.swap, listener);
};

export default {
    EVENT,
    setUser,
    onSwapUser,

    get user() {
        return user;
    },

    get userId() {
        return user && user.id;
    }
};
