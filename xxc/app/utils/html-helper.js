import Platform from 'Platform';

const isWindowsOS = Platform.env.isWindowsOS;
const isOSX = Platform.env.isOSX;

export const classes = (...args) => (
    args.map(arg => {
        if (Array.isArray(arg)) {
            return classes(arg);
        } else if (arg !== null && typeof arg === 'object') {
            return Object.keys(arg).filter(className => {
                const condition = arg[className];
                if (typeof condition === 'function') {
                    return !!condition();
                }
                return !!condition;
            }).join(' ');
        }
        return arg;
    }).filter(x => (typeof x === 'string') && x.length).join(' ')
);

export const rem = (value, rootValue = 20) => (`${value / rootValue}rem`);

export const getSearchParam = (key, search = null) => {
    const params = {};
    search = search === null ? window.location.search : search;
    if (search.length > 1) {
        if (search[0] === '?') {
            search = search.substr(1);
        }
        const searchArr = search.split('&');
        for (const pair of searchArr) {
            const pairValues = pair.split('=', 2);
            if (pairValues.length > 1) {
                try {
                    params[pairValues[0]] = decodeURIComponent(pairValues[1]);
                } catch (_) {
                    if (DEBUG) {
                        console.error(_, {key, search});
                    }
                    params[pairValues[0]] = '';
                }
            } else {
                params[pairValues[0]] = '';
            }
        }
    }
    return key ? params[key] : params;
};

export const strip = html => {
    if (typeof document !== 'undefined') {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
    return html.replace(/<(?:.|\n)*?>/gm, '');
};

export const isWebUrl = url => {
    if (typeof url !== 'string') {
        return false;
    }
    return (/^(https?):\/\/[-A-Za-z0-9\u4e00-\u9fa5+&@#/%?=~_|!:,.;]+[-A-Za-z0-9\u4e00-\u9fa5+&@#/%=~_|]$/ig).test(url);
};

const specialKeys = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    16: 'Shift',
    17: 'Ctrl',
    18: 'Alt',
    19: 'Pause',
    20: 'Capslock',
    27: 'Esc',
    32: 'Space',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down',
    45: 'Insert',
    46: 'Del',
    96: '0',
    97: '1',
    98: '2',
    99: '3',
    100: '4',
    101: '5',
    102: '6',
    103: '7',
    104: '8',
    105: '9',
    106: '*',
    107: '+',
    109: '-',
    110: '.',
    111: '/',
    112: 'F1',
    113: 'F2',
    114: 'F3',
    115: 'F4',
    116: 'F5',
    117: 'F6',
    118: 'F7',
    119: 'F8',
    120: 'F9',
    121: 'F10',
    122: 'F11',
    123: 'F12',
    144: 'NumLock',
    145: 'Scroll',
    191: '/',
    224: 'Meta'
};
const modifyKeys = new Set(['Alt', 18, 'Meta', 224, 'Ctrl', 17, 'Shift', 16]);

export const formatKeyDecoration = decoration => {
    if (decoration) {
        if (isWindowsOS) {
            decoration = decoration.replace('Meta', 'Windows').replace('Command', 'Windows').replace('Option', 'Alt');
        } else if (isOSX) {
            decoration = decoration.replace('Meta', 'Command').replace('Windows', 'Command').replace('Alt', 'Option');
        } else {
            decoration = decoration.replace('Command', 'Meta').replace('Windows', 'Meta').replace('Option', 'Alt');
        }
    }
    return decoration;
};

export const getKeyDecoration = event => {
    const keyCode = event.keyCode;
    const shortcut = [];
    if (event.shiftKey) {
        shortcut.push('Shift');
    }
    if (event.ctrlKey) {
        shortcut.push('Ctrl');
    }
    if (event.altKey) {
        shortcut.push('Alt');
    }
    if (event.metaKey) {
        shortcut.push('Meta');
    }
    if (keyCode && !modifyKeys.has(keyCode)) {
        if (specialKeys[keyCode]) {
            shortcut.push(specialKeys[keyCode]);
        } else {
            shortcut.push(String.fromCharCode(keyCode) || event.key);
        }
    }
    return formatKeyDecoration(shortcut.join('+'));
};

export default {
    classes,
    rem,
    getSearchParam,
    strip,
    isWebUrl,
    getKeyDecoration,
    formatKeyDecoration
};
