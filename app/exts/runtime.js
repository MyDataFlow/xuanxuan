import Xext from './external-api';
import Exts from './exts';
import manager from './manager';

global.Xext = Xext;

// load exts modules
const loadModules = () => {
    Exts.exts.forEach(ext => {
        if (ext.isDev) {
            const reloadExt = manager.reloadDevExtension(ext);
            if (reloadExt) {
                ext = reloadExt;
            }
        }

        if (ext.hasModule) {
            if (ext.lazy) {
                if (DEBUG) {
                    console.collapse('Extension Lazy load', 'greenBg', this.name, 'greenPale');
                    console.log('extension', ext);
                    console.groupEnd();
                }
            } else {
                ext.loadModule(Xext);
            }
        }
    });
};

export default {
    loadModules,
};
