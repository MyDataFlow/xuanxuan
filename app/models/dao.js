import {Entity}        from './entities';
import R               from '../resource';
import PouchDB         from '../assets/pouchdb';
import Member          from 'Models/member';

if(DEBUG && process.type !== 'renderer') {
    console.error('DAO must run in renderer process.');
}

/**
 * The DAO handler
 */
class DAO {

    /**
     * Get database version
     * @return {number}
     */
    static get version() {
        return 0; // change at 2017-01-12 16:27:15
    }

    /**
     * Database access object constructor
     * @param  {User} user
     * @return {Void}
     */
    constructor(user, emiter) {
        this.user = user;
        this.emiter = emiter;
        this._createDatabase();

        /**
         * Set or get inner values stored in this.$
         * @return {Object}
         */
        this.$ = function() {
            let argumentsLength = arguments.length;
            if(argumentsLength === 1) {
                let arg = arguments[0];
                if(typeof(arg) === 'object') {
                    Object.assign(this.$, arg);
                } else {
                    return this.$[arg];
                }
            } else if(argumentsLength === 2) {
                this.$[arguments[0]] = arguments[1];
            }
            return this;
        };

        this.$.members = [];
    }

    /**
     * Emit event with given emiter
     * @param  {...Any} params
     * @return {Void}
     */
    _emit(...params) {
        if(this.emiter && this.emiter.emit) {
            this.emiter.emit(...params);
        }
    }

    /**
     * Set inner values
     * @param {String|Object} key
     * @param {Any} val 
     */
    $set(key, val) {
        if(typeof(key) === 'object') {
            Object.assign(this.$, key);
        } else {
            this.$[key] = val;
        }
    }

    /**
     * Get inner value
     * @param  {String} key
     * @return {any}
     */
    $get(key) {
        return this.$[key];
    }

    /**
     * Create database with PouchDB
     * @return {PouchDB}
     */
    _createDatabase() {
        let dbName = this.user.identify;

        this.db = new PouchDB(dbName, {
            adapter: 'websql',
            auto_compaction: true
        });

        let rebuildDb = (callback) => {
            this.db.destroy().then(() => {
                this.db = new PouchDB(dbName, {
                    adapter: 'websql',
                    auto_compaction: true
                });
                this.db.put({_id: '_local/config', version: DAO.version});
                (typeof callback === 'function') && callback();
            });
        };

        this.db.get('_local/config').then(config => {
            if(config.version !== DAO.version) {
                rebuildDb(() => {
                    this._emit(R.event.database_rebuild, {newVersion: DAO.version, oldVersion: config.version});
                });
            }
        }).catch(rebuildDb);

        this.db.info().then(result => {
            console.groupCollapsed('%c DATABASE ' + dbName, 'display: inline-block; font-size: 10px; color: #fff; background: #3F51B5; padding: 1px 5px; border-radius: 2px;');
            console.log(result);
            console.groupEnd();
        }).catch(err => {
            console.groupCollapsed('%c DATABASE ' + dbName + ' with error', 'display: inline-block; font-size: 10px; color: #fff; background: #E91E63; padding: 1px 5px; border-radius: 2px;');
            console.log(err);
            console.groupEnd();
        });

        this.dbName = dbName;

        return this.db;
    }

    /**
     * Update or insert entities to database
     * @param  {Entity} entity
     * @return {Promise}
     */
    upsert(entities) {
        if(Array.isArray(entities)) {
            return Promise.all(entities.map(entity => this.upsert(entity)));
        }
        let entity = entities;

        return new Promise((resolve, reject) => {
            this.db.put(entity).then(resolve).catch(error => {
                if(error.status === 409) {
                    this.db.get(entity._id).then(dbEntity => {
                        entity._rev = dbEntity._rev;
                        return this.db.put(entity);
                    }).then(response => {
                        resolve(response);
                    }).catch(reject);
                } else {
                    // if(DEBUG) {
                        console.error('Database upsert error', error, entity, JSON.stringify(entity));
                    // }
                    reject(error)
                }
            });
        });
    }

    /**
     * Delete entity in local database
     * @param  {Entity} entity
     * @return {Promise}
     */
    delete(entity) {
        entity._deleted = true;
        if(!entity._rev) {
            return this.db.get(entity._id).then(dbEntity => {
                entity._rev = dbEntity._rev;
                return this.db.remove(entity);
            });
        }
        return this.db.remove(entity);
    }

    /**
     * Get all entities
     * @param  {String} entityName
     * @param  {Object} options
     * @return {Entity}
     */
    all(entityName, options) {
        return new Promise((resolve, reject) => {
            this.db.allDocs(Object.assign({
                include_docs: true, 
                startkey: entityName + '/',
                endkey: entityName + '/\uffff',
            }, options)).then(data => {
                let indexOf = entityName.indexOf('/');
                if(indexOf > -1) {
                    entityName = entityName.substring(0, indexOf);
                }
                resolve(data.rows.map(row => Entity.create(entityName, row.doc)));
            }).catch(reject);
        });
    }

    /**
     * Get entity by given id
     * @param  {String} entityName/_id
     * @param  [Number] id   entity remote id
     * @return {Entity}
     */
    get(/*(entityName, id) or (_id)*/) {
        let _id = arguments.length > 1 ? (arguments[0] + '/' + arguments[1]) : arguments[0];
        return new Promise((resolve, reject) => {
            this.db.get(_id).then(data => {
                resolve(Entity.create(data.typeName, data));
            }).catch(reject);
        });
    }

    /**
     * Get members
     * @param  {Function | Array} condition optional
     * @return {Array[Member]}
     */
    getMembers(condition, sortList) {
        if(typeof(condition) === 'function') {
            let result = [];
            Object.keys(this.$.members).forEach(x => {
                let member = this.$.members[x];
                if(condition(member)) {
                    result.push(member);
                }
            });
            return result;
        } else if(Array.isArray(condition)) {
            let result = [];
            condition.forEach(x => {
                let member = this.getMember(x, true);
                if(member) {
                    result.push(member);
                }
            });
            return result;
        }
        let members = Object.keys(this.$.members).map(x => this.$.members[x]);
        if(condition === true || sortList) members = Member.sort(members);
        return members;
    }

    /**
     * Get all members
     * @return {Array}
     */
    get members() {
        return this.$.members;
    }

    /**
     * Init members
     * @param  {Array} members
     * @return {Void}
     */
    initMembers(members) {
        this.$.members = {};

        members.forEach(member => {
            member.isMyself = member.id === this.user.id;
            this.$.members[member.id] = member;
        });
        this.upsert(members);
        this._emit(R.event.data_change, {members: members});
    }

    /**
     * Update members
     * @param  {Array} members
     * @return {Void}
     */
    updateMembers(members) {
        if(!Array.isArray(members)) {
            members = [members];
        }
        members.forEach(member => {
            let savedMember = this.$.members[member.id];
            if(savedMember) {
                savedMember.assign(member);
            } else {
                this.$.members[member.id] = member;
            }
        });
        this.upsert(members);
        this._emit(R.event.data_change, {members: members});
    }

    /**
     * Get member by id
     * @param  {number} id
     * @return {Member}
     */
    getMemberById(id) {
        return this.$.members[id];
    }

    /**
     * Get member
     * @param  {String | Number} idOrAccount
     * @return {Member}
     */
    getMember(idOrAccount) {
        let member = this.$.members[idOrAccount];
        if(!member) {
            let findId = Object.keys(this.$.members).find(x => {
                return this.$.members[x].account === idOrAccount;
            });
            if(findId) member = this.$.members[findId]
        }
        return member;
    }

    /**
     * Guess member from id, account or realname
     * @param  {any} guess
     * @return {Member}
     */
    guessMember(guess) {
        let member = this.getMemberById(guess);
        if(!member) {
            let findId = Object.keys(this.$.members).find(x => {
                const xMember = this.$.members[x];
                return xMember.account === guess || xMember.realname === guess;
            });
            if(findId) member = this.$.members[findId]
        }
        return member;
    }
}

export default DAO;
