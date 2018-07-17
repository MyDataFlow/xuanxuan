import Dexie from 'dexie';
import {ChatMessage as Message} from '../models';

const DB_VERSION = 1;
let lastCreateDb = null;

if (DEBUG) {
    global.$.Dexie = Dexie;
}

class Database {
    static VERSION = DB_VERSION;

    constructor(userIdentify) {
        if (typeof userIdentify === 'object') {
            userIdentify = userIdentify.identify;
        }
        this._userIdentify = userIdentify;
        Dexie.exists(userIdentify).then(exists => {
            this._exists = exists;
        }).catch(error => {
            if (DEBUG) {
                console.warn('Dexie error', error);
            }
        });
        this._db = new Dexie(userIdentify);
        this._db.version(DB_VERSION).stores({
            // [Entity.NAME]: Entity.SCHEMA.dexieFormat,
            // [Member.NAME]: Member.SCHEMA.dexieFormat,
            // [Chat.NAME]: Chat.SCHEMA.dexieFormat,
            [Message.NAME]: Message.SCHEMA.dexieFormat,
        });
    }

    get isExists() {
        return this._exists;
    }

    get identify() {
        return this._userIdentify;
    }

    // get members() {
    //     return this._db[Member.NAME];
    // }

    // get chats() {
    //     return this._db[Chat.NAME];
    // }

    get chatMessages() {
        return this._db[Message.NAME];
    }

    get all() {
        return this._db;
    }

    destroy() {
        this._db.close();
    }

    static create(userIdentify) {
        if (typeof userIdentify === 'object') {
            userIdentify = userIdentify.identify;
        }
        if (!lastCreateDb) {
            lastCreateDb = new Database(userIdentify);
        } else if (lastCreateDb.identify !== userIdentify) {
            lastCreateDb.destroy();
            lastCreateDb = new Database(userIdentify);
        }
        return lastCreateDb;
    }
}

export default Database;

