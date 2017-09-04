import profile from './profile';
import members from './members';
import im from './im';
import db from './db';
import server from './server';
import notice from './notice';
import theme from './theme';
import events from './events';

const app = {
    profile,
    members,
    im,
    db,
    server,
    notice,
    theme,
    events,

    get user() {
        return profile.user
    }
};

if(DEBUG) {
    global.$.App = app;
}

export default app;
