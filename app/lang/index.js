import DefaultLang from './default.json';
import ZhcnLang from './zh-cn.json';
import StringHelper from '../utils/string-helper';

const DEFAULT_LANG = 'zh-cn';

let langData = Object.assign({}, DefaultLang, ZhcnLang);
let currentLangName = DEFAULT_LANG;

/**
 * Get language setting and return string
 * @param  {string} name
 * @param  {string} defaultValue
 * @return {string}
 */
const string = (name, defaultValue) => {
    let value = langData[name];
    return value === undefined ? defaultValue : value;
};

const format = (name, ...args) => {
    let str = string(name);
    if(args && args.length) {
        try {
            return StringHelper.format(str, ...args);
        } catch(e) {
            throw new Error(`Cannot format lang string with key '${name}', the lang string is '${str}'.`)
        }
    }
    return str;
};

/**
 * Error
 *
 * @param {any} err
 * @memberof Lang
 */
const error = err => {
    if(typeof err === 'string') {
        return string(`error.${err}`, err);
    }
    let message = '';
    if(err.code) {
        message += string(`error.${err.code}`, `[Code: ${err.code}]`);
    }
    if(err.message && err.message !== err.code) {
        message += '(' + string(`error.${err.message}`, err.message) + ')';
    }
    if(err.formats) {
        if(!Array.isArray(err.formats)) {
            err.formats = [err.formats];
        }
        message = StringHelper.format(message, ...err.formats);
    }
    if(DEBUG) {
        console.error('lang.error()', err);
    }
    return message;
};

const lang = {
    format,
    string,
    error,

    get name() {
        return currentLangName;
    }
};

Object.assign(lang, langData);

if(DEBUG) global.Lang = lang;

export default lang;
