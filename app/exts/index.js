import all from './exts';
import ui from './ui';
import manager from './manager';

const exts = {
    all,
    ui,
    manager,
};

if (DEBUG) {
    global.$.exts = exts;
}

export default exts;
