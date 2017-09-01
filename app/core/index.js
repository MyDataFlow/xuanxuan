import profile from './profile';
import members from './members';
import im from './im';
import db from './db';
import server from './server';
import notice from './notice';
import theme from './theme';
import lang from './lang';
import events from './events';

export default {
    profile,
    members,
    im,
    db,
    server,
    notice,
    theme,
    lang,
    events,

    get user() {
        return profile.user
    }
};
