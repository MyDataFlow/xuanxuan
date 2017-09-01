import UUID  from 'uuid/v4';
import Schema from './entity-schema';

/**
 * Entity
 */
class Entity {

    static NAME = 'Entity';
    static SCHEMA = new Schema({
        'gid': {type: 'string', primaryKey: true},
        'id': {type: 'int', indexed: true},
    });

    constructor(data, entityType) {
        this.$ = {};
        if(typeof data == 'object') {
            this.$set(data);
        }

        this.ensureGid();
        this._entityType = entityType;
    }

    ensureGid() {
        if(!this.$.gid) {
            this.$.gid = UUID();
        }
    }

    plain() {
        this.ensureGid();
        return this.$;
    }

    get entityType() {
        return this._entityType || Entity.name;
    }

    get gid() {
        return this.$get('gid');
    }

    get id() {
        return this.$get('id', 0);
    }

    set id(newId) {
        this.$set('id', newId);
    }

    get scheam() {
        return Entity.SCHEMA;
    }

    /**
     * Set inner values
     * @param {String|Object} key
     * @param {Any} val
     */
    $set(key, val) {
        if(typeof key === 'object') {
            Object.keys(key).forEach(k => {
                this.$set(k, key[k]);
            });
        } else {
            let scheam = this.scheam;
            if(scheam) {
                val = scheam.convertValue(key, val);
            }
            this.$[key] = val;
        }
    }

    /**
     * Get inner value
     * @param  {String} key
     * @param  {String} defaultValue
     * @return {any}
     */
    $get(key, defaultValue) {
        let value = this.$[key];
        if(value !== undefined) {
            let scheam = this.scheam;
            if(scheam) {
                value = scheam.convertValue(key, val);
            }
        } else {
            value = defaultValue;
        }
        return value;
    }
}

export default Entity;
