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
    return html.replace(/<(?:.|\n)*?>/gm, '');
};

export const escape = html => {
    const tmp = document.createElement('DIV');
    tmp.innerText = html;
    return tmp.innerHTML || '';
};

export const isWebUrl = url => {
    if (typeof url !== 'string') {
        return false;
    }
    return (/^(https?):\/\/[-A-Za-z0-9\u4e00-\u9fa5+&@#/%?=~_|!:,.;]+[-A-Za-z0-9\u4e00-\u9fa5+&@#/%=~_|]$/ig).test(url);
};

export const linkify = (text) => {
    return (text || "").replace(
        /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
        (match, space, url) => {
            var hyperlink = url;
            if (!hyperlink.match('^https?:\/\/')) {
                hyperlink = 'http://' + hyperlink;
            }
            return space + '<a href="' + hyperlink + '">' + url + '</a>';
        }
    );
};

export default {
    classes,
    rem,
    getSearchParam,
    strip,
    isWebUrl,
};
