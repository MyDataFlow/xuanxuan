import DefaultLang from './zh-cn.json';
import StringHelper from '../../utils/string-helper';

const DEFAULT_LANG = 'zh-cn';

let langData = Object.assign({}, DefaultLang);
let lang = DEFAULT_LANG;

/**
 * Get language setting and return string
 * @param  {string} name
 * @param  {string} defaultValue
 * @return {string}
 */
const string = (name, defaultValue) => {
    let value;
    if(langData[name] === undefined && name.indexOf('.') > -1) {
        value = langData;
        name.split('.').forEach(n => {
            value = value[n];
        });
    } else {
        value = langData[name];
    }
    return value === undefined ? defaultValue : value;
};

const format = (name, ...args) => {
    let str = string(name);
    if(args && args.length) {
        return StringHelper.format(str, ...args);
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
        return string(`errors.${err}`, err);
    }
    let message = '';
    if(err.code) {
        message += string(`errors.${err.code}`, `[Code: ${err.code}]`);
    }
    if(err.message) {
        message += string(`errors.${err.message}`, err.message);
    }
    if(err.formats) {
        message = message.format(err.formats);
    }
    if(DEBUG) {
        console.error('lang.error()', err);
    }
    return message;
};

langData.string = string;
langData.format = format;
langData.error = error;

if(DEBUG) global.Lang = langData;

export default langData;
