import system from 'Config/system.json';
import media from 'Config/media.json';
import ui from 'Config/ui.json';
import lang from 'Config/lang.json';
import pkg from '../package.json';

const config = {
    system,
    media,
    ui,
    pkg,
    exts: {},
    lang,
};

export const updateConfig = (newConfig) => {
    Object.keys(newConfig).forEach(key => {
        Object.assign(config[key], newConfig[key]);
    });
};

const {configurations} = pkg;
if (configurations) {
    updateConfig(configurations);
}

export default config;
