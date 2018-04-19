import UUID from 'uuid/v4';
import Schema from './entity-schema';
import timeSequence from '../../utils/time-sequence';

/**
 * Entity
 */
class Entity {
    static NAME = 'Entity';
    static SCHEMA = new Schema({
        gid: {type: 'string', primaryKey: true},
        id: {type: 'int', indexed: true},
    });

    constructor(data, entityType) {
        this.$ = {};
        if (typeof data === 'object') {
            this.$set(data);
        }

        this.ensureGid();
        this._entityType = entityType;
        this._updateId = timeSequence();
    }

    assign(...data) {
        Object.assign(this, ...data);
        return this;
    }

    ensureGid() {
        if (!this.$.gid) {
            this.$.gid = UUID();
        }
    }

    plain() {
        this.ensureGid();
        return this.$;
    }

    get updateId() {
        return this._updateId;
    }

    renewUpdateId() {
        this._updateId = timeSequence();
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

    get schema() {
        return Entity.SCHEMA;
    }

    /**
     * Set inner values
     * @param {String|Object} key
     * @param {Any} val
     */
    $set(key, val, ignoreUpdateId = false) {
        if (typeof key === 'object') {
            Object.keys(key).forEach(k => {
                this.$set(k, key[k], true);
            });
        } else {
            const schema = this.schema;
            if (schema) {
                const meta = schema.of(key);
                if (meta && meta.aliasFor) {
                    key = meta.aliasFor;
                }
                val = schema.convertSetterValue(key, val, this);
            }
            this.$[key] = val;
        }
        if (!ignoreUpdateId) {
            this.renewUpdateId();
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
        const schema = this.schema;
        if (schema) {
            const meta = schema.of(key);
            if (meta && meta.aliasFor) {
                key = meta.aliasFor;
            }
            value = schema.convertGetterValue(key, value, this);
        }
        if (value === undefined) {
            value = defaultValue;
        }
        return value;
    }
}

export default Entity;
