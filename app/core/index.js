import profile from './user-profile';
import members from './members';
import im from './im';
import db from './db';
import server from './server';

export default {
    profile,
    members,
    im,
    db,
    server,

    get user() {
        return profile.user
    }
};
