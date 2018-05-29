import StringHelper from '../../utils/string-helper';

const TYPES = {
    int: 'int',
    float: 'float',
    string: 'string',
    any: 'any',
    boolean: 'boolean',
    object: 'object',
    array: 'array',
    timestamp: 'timestamp',
    datetime: 'datetime',
    set: 'set',
    json: 'json',
};


/**
 * Default entity values converters
 * @type {Object}
 */
const defaultValuesConveter = {
    int: val => {
        if (typeof val !== 'number') {
            val = Number.parseInt(val, 10);
        }
        return val;
    },
    float: val => {
        if (typeof val !== 'number') {
            val = Number.parseFloat(val);
        }
        return val;
    },
    timestamp: val => {
        if (typeof val === 'string') {
            val = new Date(val).getTime();
        }
        if (val < 10000000000) {
            val *= 1000;
        }
        return val;
    },
    string: val => {
        if (val !== null && val !== undefined && typeof val !== 'string') {
            return `${val}`;
        }
        return val;
    },
    boolean: val => {
        if (typeof val === 'string') {
            return val === '1' || val === 'true' || val === 'yes';
        }
        return !!val;
    },
    set: val => {
        if (val instanceof Set) {
            return val;
        }
        if (Array.isArray(val)) {
            return new Set(val);
        }
        const valType = typeof val;
        if (valType === 'string') {
            const set = new Set();
            val.split(',').forEach(x => {
                if (x !== '') set.add(x);
            });
            return set;
        }
        return new Set(val);
    },
    array: val => {
        if (Array.isArray(val)) {
            return val;
        }
        if (typeof val === 'string') {
            return val.split(',');
        }
        return [val];
    },
    datetime: val => {
        if (val instanceof Date) {
            return val;
        }
        return new Date(val);
    },
    json: json => {
        if (typeof val === 'string') {
            if (StringHelper.isNotEmpty(json)) {
                return JSON.parse(json);
            }
            return null;
        }
        return json;
    }
};

class EntitySchema {
    constructor(schema) {
        let primaryKeyNumber = 0;
        Object.keys(schema).forEach(name => {
            const meta = schema[name];
            if (meta.type && !TYPES[meta.type]) {
                throw new Error(`Cannot create scheam, because the type(${meta.type}) is not a valid type.`);
            }
            if (meta.primaryKey) {
                primaryKeyNumber++;
                this.primaryKey = name;
            }
        });
        if (primaryKeyNumber !== 1) {
            if (DEBUG) {
                console.trace('schema', schema);
            }
            throw new Error(`Cannot create scheam, because there has ${primaryKeyNumber} primary key(s).`);
        }
        this.schema = schema;
    }

    of(name, useDefault) {
        const scheam = this.schema[name];
        if (scheam) {
            return Object.assign({
                type: TYPES.any,
                indexed: false,
            }, this.schema[name]);
        } else if (useDefault) {
            if (typeof useDefault === 'object') {
                return useDefault;
            }
            return {
                type: TYPES.any,
                indexed: false,
            };
        }
        return null;
    }

    convertValue(name, value, meta) {
        meta = meta || this.of(name);
        if (meta) {
            if (meta.type && defaultValuesConveter[meta.type]) {
                return defaultValuesConveter[meta.type](value);
            }
            if (value === undefined && meta.defaultValue !== undefined) {
                value = meta.defaultValue;
            }
        }
        return value;
    }

    convertGetterValue(name, value, thisObj) {
        const meta = this.of(name);
        if (meta) {
            if (meta.getter) {
                return meta.getter.call(thisObj, value, thisObj);
            }
            if (meta.type && defaultValuesConveter[meta.type]) {
                return defaultValuesConveter[meta.type](value);
            }
            if (value === undefined && meta.defaultValue !== undefined) {
                value = meta.defaultValue;
            }
        }
        return value;
    }

    convertSetterValue(name, value, thisObj) {
        const meta = this.of(name);
        if (meta) {
            if (meta.setter) {
                return meta.setter.call(thisObj, value, thisObj);
            }
            if (meta.type && defaultValuesConveter[meta.type]) {
                return defaultValuesConveter[meta.type](value);
            }
            if (value === undefined && meta.defaultValue !== undefined) {
                value = meta.defaultValue;
            }
        }
        return value;
    }

    extend(newSchema) {
        return EntitySchema.extend(this, newSchema);
    }

    get dexieFormat() {
        const formats = [this.primaryKey];
        Object.keys(this.schema).forEach(name => {
            const meta = this.schema[name];
            if (meta.indexed !== false) {
                if (meta.unique) {
                    formats.push(`&${name}`);
                } else if (meta.multiValued) {
                    formats.push(`*${name}`);
                } else if (meta.indexed) {
                    formats.push(name);
                }
            }
        });
        return formats.join(',');
    }

    static extend(parent, newSchema) {
        return new EntitySchema(Object.assign({}, parent.schema, newSchema));
    }
}

export default EntitySchema;
