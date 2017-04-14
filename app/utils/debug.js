if(typeof DEBUG === 'undefined') {
    global.DEBUG = process.env.NODE_ENV !== 'production';
} else {
    global.DEBUG = DEBUG;
}

if(global.DEBUG) {
    // Mute react warning.
    console._error = console.error;
    console.error = (errMessage, ...args) => {
        if(typeof errMessage === 'string' && errMessage.indexOf('Warning: Unknown prop') === 0) {
            return;
        }
        return console._error(errMessage, ...args);
    };
}

global.TEST = true;

global.test = (toggle) => {
    global.TEST = toggle === undefined ? (!global.TEST) : !!toggle;
    return 'TEST=' + global.TEST;
};

export default global.DEBUG;
