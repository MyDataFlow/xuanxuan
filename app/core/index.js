import profile from './profile';
import members from './members';
import im from './im';
import db from './db';
import server from './server';
import notice from './notice';
import events from './events';
import ui from './ui';
import models from './models';

const app = {
    profile,
    members,
    im,
    db,
    server,
    notice,
    events,
    ui,
    models,

    get user() {
        return profile.user;
    }
};

if (DEBUG) {
    global.$.App = app;
}

export default app;
