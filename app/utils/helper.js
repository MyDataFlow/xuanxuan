import fs           from 'fs';
import os           from 'os';
import Marked       from 'marked';
import HighlightJS  from 'highlight.js';
import mkdirp       from 'mkdirp';
import PinYin       from 'pinyin';
import Moment       from 'moment';

Moment.locale('zh-cn');

/**
 * Init markdown helpers
 */
Marked.setOptions({
    highlight: code => {
        return HighlightJS.highlightAuto(code).value;
    },
    gfm: true,
    sanitize: true
});

const OS_PLATFORM = os.platform();
let _guid = 0;

// String format prototype method
if (!String.prototype.format) {
    String.prototype.format = function (args) {
        var result = this;
        if (arguments.length > 0) {
            var reg;
            if (arguments.length == 1 && typeof (args) == "object") {
                for (var key in args) {
                    if (args[key] !== undefined) {
                        reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, args[key]);
                    }
                }
            } else {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] !== undefined) {
                        reg = new RegExp("({[" + i + "]})", "g");
                        result = result.replace(reg, arguments[i]);
                    }
                }
            }
        }
        return result;
    };
}

const UNITS = {
    B: 1,
    KB: 1024,
    MB: 1024*1024,
    GB: 1024*1024*1024,
    TB: 1024*1024*1024*1024,
};


// set global variables
// global.document = window.document;
// global.navigator = window.navigator;

/**
 * Global helper methods
 */
const Helper = {

    /**
     * Plain a object
     * @param  {object} obj
     */
    plain(obj) {
        if(obj === undefined) obj = this;
        if(Array.isArray(obj)) {
            return obj.map(Helper.plain);
        }
        var objType = typeof obj;
        if(obj !== null && objType === 'object') {
            var plainObj = {};
            Object.keys(obj).forEach(key => {
                let val = obj[key];
                var typeVal = typeof val;
                if(key && key[0] !== '$' && typeVal !== 'function') {
                    plainObj[key] = typeVal === 'object' ? Helper.plain(val) : val;
                }
            });
            return plainObj;
        }
        if(objType === 'function') return;
        return obj;
    },

    /**
     * Convert str to pin str
     * @param  {string} str
     * @param  {array|string} styles
     * @param  {string} separator
     * @return {string}
     */
    pinyin(str, styles, separator) {
        if(!styles) {
            styles = [PinYin.STYLE_NORMAL, PinYin.STYLE_FIRST_LETTER, PinYin.STYLE_INITIALS];
        }
        if(!Array.isArray(styles)) {
            styles = [styles];
        }
        if(separator === undefined) {
            separator = ' ';
        }
        return styles.map(style => {
            if(typeof style === 'string') {
                switch(style) {
                    case 'normal':
                    case 'STYLE_NORMAL':
                        style = PinYin.STYLE_NORMAL;
                        break;
                    case 'first-letter':
                    case 'STYLE_FIRST_LETTER':
                        style = PinYin.STYLE_FIRST_LETTER;
                        break;
                    case 'initials':
                    case 'STYLE_INITIALS':
                        style = PinYin.STYLE_INITIALS;
                        break;
                }
            }
            return PinYin(str, {style}).map(x => x[0]).join('');
        }).join(separator);
    },

    /**
     * Apply markdown systax to text
     * @param  {string} content
     * @return {string}
     */
    markdown(content) {
        return Marked(content);
    },

    /**
     * Encode html
     * @param  {string} s
     * @return {string}
     */
    htmlEncode(s) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(s));
        return div.innerHTML;
    },

    /**
     * Check whether the string is undefined or null or empty
     * @param  {string}  s
     * @return {boolean}
     */
    isEmptyString(s) {
        return s === undefined || s === null || s === '';
    },

    /**
     * Check whether the string is not undefined and null and empty
     * @param  {string}  s
     * @return {boolean}
     */
    isNotEmptyString(s) {
        return s !== undefined && s !== null && s !== '';
    },

    /**
     * Convert a arr to group as object
     * @param  {Array} arr
     * @param  {function} func
     * @return {object}
     */
    arrayGroup(arr, func) {
        let group = {};
        arr.forEach(x => {
            let name = func(x);
            if(group[name]) {
                group[name].push(x);
            } else {
                group[name] = [x];
            }
        });
        return group;
    },

    sortedArrayGroup(arr, func, sorter) {
        let group = Helper.arrayGroup(arr, func);
        let sortedArr = Object.keys(group).map(name => {
            return {name, items: group[name]};
        });
        if(sorter) {
            sortedArr.sort(sorter);
        }
        return sortedArr;
    },

    /**
     * Load json from file
     * @param  {string} filename
     * @param  {boolean} ignoreError
     * @return {Promise}
     */
    loadJSON(filename, ignoreError) {
        return new Promise((resolve, reject) => {
            fs.stat(filename, function(err, stats) {
                if(err) {
                    if(DEBUG) console.warn('Can\'t check file stats of ' + filename);
                    return ignoreError ? resolve() : reject(err);
                }

                if(stats.isFile()) {
                    fs.readFile(filename, 'utf8', function(err, data) {
                        if(err) {
                            if(DEBUG) console.warn('Can\'t read file from ' + filename);
                            return ignoreError ? resolve() : reject(err);
                        }

                        try {
                            let json = JSON.parse(data);
                            return resolve(json);
                        } catch(e) {
                            if(DEBUG) console.warn('Load json from a wrong format content.', {data, filename});
                            return ignoreError ? resolve() : reject(e);
                        }

                    });
                } else {
                    let error = new Error('File in ' + filename + ' not exists. stat: ' + configFileStat);
                    if(DEBUG) console.warn(error);
                    return ignoreError ? resolve() : reject(error);
                }
            });
        });
    },

    /**
     * Load json from file sync
     * @param  {string} filename
     * @param  {object} defaultJson
     * @return {object}
     */
    loadJSONSync(filename, defaultJson = null) {
        if(this.isFileExist(filename)) {
            try {
                let data = fs.readFileSync(filename, {encoding: 'utf8'});
                return JSON.parse(data);
            } catch(err) {
                console.error('Load json sync: ', err);
            }
        }
        return defaultJson;
    },

    /**
     * Write data as json text to a file
     * @param  {string} filename
     * @param  {object | string} data
     * @return {void}
     */
    writeDataSync(filename, data) {
        if(typeof data === 'object') {
            data = JSON.stringify(data);
        }
        fs.writeFileSync(filename, data, {encoding: 'utf8'});
    },

    writeData(filename, data, callback) {
        return new Promise((resolve, reject) => {
            if(typeof data === 'object') {
                data = JSON.stringify(data);
            }
            fs.writeFile(filename, data, 'utf8', (err) => {
                if(err) {
                    if(DEBUG) console.warn('WRITE DATA failed', err, {filename, data});
                    reject(err);
                } else {
                    resolve();
                }
                if(typeof callback === 'function') {
                    callback(err);
                }
            });
        });
    },

    /**
     * Try get a path stats
     * @param  {string} path
     * @return {FileStat}
     */
    tryStatSync(path) {
        try {
            return fs.statSync(path);
        } catch(e) {
            return false;
        }
    },

    /**
     * Check whether the path is exist
     * @param  {string}  path
     * @return {boolean}
     */
    isFileExist(path) {
        let stats = this.tryStatSync(path);
        return stats && stats.isFile();
    },

    /**
     * Delete file
     *
     * @param {string} path
     * @return {Promise}
     */
    deleteFile(path) {
        return new Promise((resolve, reject) => {
            fs.unlink(path, err => {
                if(err) reject(err);
                else resolve(path);
            });
        });
    },

    /**
     * Try make directory
     * @param  {string} path
     * @return {boolean} result
     */
    tryMkdirSync(path) {
        let stats = this.tryStatSync(path);
        if(!stats || !stats.isDirectory()) {
            try {
                fs.mkdirSync(path);
            } catch(e) {
                if(DEBUG) console.warn('Helper.tryMkdirSync', path, e);
            }
            stats = this.tryStatSync(path);
            return stats && stats.isDirectory();
        }
        return true;
    },

    tryMkdirp(path) {
        return new Promise((resolve, reject) => {
            mkdirp(path, err => {
                if(err) reject(err);
                else resolve(path);
            });
        });
    },

    /**
     * Copy file
     * @param  {string} source
     * @param  {string} target
     * @return {Promise}
     */
    copyFile(source, target) {
        return new Promise(function(resolve, reject) {
            let readStream = fs.createReadStream(source);
            let writeStream = fs.createWriteStream(target);
            readStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);
            readStream.pipe(writeStream);
        });
    },

    /**
     * Save image from buffer or base64 data url
     */
    saveImage(bufferOrBase64, filePath) {
        if(typeof bufferOrBase64 === 'string') {
            let matches = bufferOrBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches.length !== 3) {
                return Promise.reject(new Error('Invalid input string'));
            }
            bufferOrBase64 = new Buffer(matches[2], 'base64');
        } else if(bufferOrBase64.toPNG) {
            bufferOrBase64 = bufferOrBase64.toPNG();
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, bufferOrBase64, err => {
                if(err) return reject(err);
                let data = {path: filePath, type: 'image/png'};
                resolve(data);
            });
        });
    },

        /**
     * Cut image
     * @param  {object} image
     * @param  {object} select
     * @return {Promise}
     */
    cutImage(image, select) {
        return new Promise((resolve, reject) => {
            let img = document.createElement('img');
            let canvas = document.createElement('canvas');
            canvas.width = select.width;
            canvas.height = select.height;

            img.onload = () => {
                let display = canvas.getContext('2d');
                display.drawImage(img, select.x, select.y, select.width, select.height, 0, 0, select.width, select.height);
                resolve({width: select.width, height: select.height, type: 'png', data: canvas.toDataURL('image/png')});
                img = canvas = display = null;
            };

            img.onerror = () => {
                reject(new Error('Cant not get user media.'));
                img = canvas = null;
            };

            img.src = 'file://' + image;
        });
    },

    /**
     * Format bytes
     * @param  {Number} size
     * @param  {Number} fixed
     * @param  {String} unit
     * @return {String}
     */
    formatBytes(size, fixed = 2, unit = '') {
        if(!unit) {
            if(size < UNITS.KB) {
                unit = 'B';
            } else if(size < UNITS.MB) {
                unit = 'KB';
            } else if(size < UNITS.GB) {
                unit = 'MB';
            } else if(size < UNITS.TB) {
                unit = 'GB';
            } else {
                unit = 'TB';
            }
        }

        return new Number(size / UNITS[unit]).toFixed(fixed) + unit;
    },

    /**
     * OS Platform
     * @type {string}
     */
    os: OS_PLATFORM,

    /**
     * Whether the OS is windows
     * @type {boolean}
     */
    isWindowsOS: OS_PLATFORM === 'win32' || OS_PLATFORM === 'win64',

    /**
     * Whether the OS is OSX
     * @type {boolean}
     */
    isOSX: OS_PLATFORM === 'osx' || OS_PLATFORM === 'darwin',

    /**
     * Whether the OS is windows xp
     * @type {boolean}
     */
    isWinXP: (OS_PLATFORM === 'win32' || OS_PLATFORM === 'win64') && os.release().startsWith('5.'),

    /**
     * Get a new guid
     * @return {number}
     */
    get guid() {
        return _guid++;
    }
};

global.Helper = Helper;

export default Helper;
