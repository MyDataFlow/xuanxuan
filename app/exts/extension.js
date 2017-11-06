import Extension, {TYPES} from './base-extension';
import AppExtension from './app-extension';
import PluginExtension from './plugin-extension';
import ThemeExtension from './theme-extension';

const createExtension = pkg => {
    switch (pkg.type) {
    case TYPES.app:
        return new AppExtension(pkg);
    case TYPES.plugin:
        return new PluginExtension(pkg);
    case TYPES.theme:
        return new ThemeExtension(pkg);
    default:
        return new Extension(pkg);
    }
};

export {AppExtension, PluginExtension, ThemeExtension, createExtension};
export default Extension;
