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

export default {
    classes,
    rem
};
