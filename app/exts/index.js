import all from './exts';
import ui from './ui';

const exts = {
    all,
    ui,
};

if (DEBUG) {
    global.$.exts = exts;
}

export default exts;
