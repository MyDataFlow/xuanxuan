const classes = (...args) => {
    return args.map(arg => {
        if(Array.isArray(arg)) {
            return cssClass(arg);
        } else if(typeof arg === 'object') {
            return Object.keys(arg).filter(className => {
                let condition = arg[className];
                if(typeof condition === 'function') {
                    return !!condition();
                } else {
                    return !!condition;
                }
            }).join(' ');
        } else {
            return arg;
        }
    }).filter(x => {
        return (typeof x === 'string') && x.length;
    }).join(' ');
};

const rem = (value, rootValue = 20) => {
    return `${value/20}rem`;
};

const getSearchParam = key => {
    const params = {};
    const search = window.location.search;
    if(search.length > 1) {
        const searchArr = search.substr(1).split('&');
        for(let pair of searchArr) {
            const pairValues = pair.split('=', 2);
            if(pairValues.length > 1) {
                params[pairValues[0]] = decodeURIComponent(pairValues[1]);
            } else {
                params[pairValues[0]] = '';
            }
        }
    }
    return key ? params[key] : params;
};

export default {
    classes,
    rem,
    getSearchParam
};
