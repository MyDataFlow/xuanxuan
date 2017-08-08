const format = (str, ...args) => {
    let result = str;
    if (args.length > 0) {
        let reg;
        if (args.length == 1 && (typeof args[0] == "object")) {
            args = args[0];
            for (let key in args) {
                if (args[key] !== undefined) {
                    reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (let i = 0; i < args.length; i++) {
                if (args[i] !== undefined) {
                    reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, args[i]);
                }
            }
        }
    }
    return result;
};

const formatDate = (date, format) => {
    if(!(date instanceof Date)) {
        date = new Date(date);
    }

    let dateInfo = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        // 'H+': date.getHours() % 12,
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        // 'q+': Math.floor((date.getMonth() + 3) / 3),
        'S+': date.getMilliseconds()
    };
    if(/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    Object.keys(dateInfo).forEach(k => {
        if(new RegExp('(' + k + ')').test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? dateInfo[k] : ('00' + dateInfo[k]).substr(('' + dateInfo[k]).length));
        }
    })
    return format;
};

const BYTE_UNITS = {
    B: 1,
    KB: 1024,
    MB: 1024*1024,
    GB: 1024*1024*1024,
    TB: 1024*1024*1024*1024,
};
const formatBytes = (size, fixed = 2, unit = '') => {
    if(!unit) {
        if(size < BYTE_UNITS.KB) {
            unit = 'B';
        } else if(size < BYTE_UNITS.MB) {
            unit = 'KB';
        } else if(size < BYTE_UNITS.GB) {
            unit = 'MB';
        } else if(size < BYTE_UNITS.TB) {
            unit = 'GB';
        } else {
            unit = 'TB';
        }
    }

    return new Number(size / BYTE_UNITS[unit]).toFixed(fixed) + unit;
};

/**
 * Check whether the string is undefined or null or empty
 * @param  {string}  s
 * @return {boolean}
 */
const isEmpty = (s) => {
    return s === undefined || s === null || s === '';
};

/**
 * Check whether the string is not undefined and null and empty
 * @param  {string}  s
 * @return {boolean}
 */
const isNotEmpty = (s) => {
    return s !== undefined && s !== null && s !== '';
};

export default {
    format,
    isEmpty,
    isNotEmpty,
    formatBytes,
    formatDate
}
