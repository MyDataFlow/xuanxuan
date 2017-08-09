import Store from '../../utils/store';
import Helper from '../../utils/helper';
import User from '../../models/user';

const KEY_USER_PREFIX = 'USER::';
const KEY_USER_LIST = 'USER_LIST';

const allUsers = () => {
    return Store.get(KEY_USER_LIST, {});
};

const getUser = (identify) => {
    if(identify) {
        let user = Storage.get(`${KEY_USER_PREFIX}${identify}`);
        return user ? new User(user) : null;
    } else {
        let users = allUsers();
        let maxTime = 0, maxTimeIndentify = null;
        Object.keys(users).forEach(identify => {
            let time = users[identify];
            if(time > maxTime) {
                time = maxTime;
                maxTimeIndentify = identify;
            }
        });
        return maxTimeIndentify ? getUser(maxTimeIndentify) : null;
    }
};

const userList = () => {
    let users = allUsers();
    return Object.keys(users).map(getUser).sort((x, y) => y.lastLoginTime - x.lastLoginTime);
};

const saveUser = (user) => {
    const identify = user.identify;

    Store.set(`${KEY_USER_PREFIX}${identify}`, user.plain());

    let users = allUsers();
    users[identify] = new Date().getTime();
    Store.set(KEY_USER_LIST, users);
};

const removeUser = (user) => {
    const identify = typeof user === 'object' ? user.identify : user;
    Store.remove(`${KEY_USER_PREFIX}${identify}`);

    let users = allUsers();
    if(users[identify]) {
        delete users[identify];
        Store.set(KEY_USER_LIST, users);
    }
};

export default {
    allUsers,
    getUser,
    userList,
    saveUser,
    removeUser,
    store: Store
};
