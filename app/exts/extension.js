import Extension, {TYPES} from './base-extension';
import AppExtension from './app-extension';
import PluginExtension from './plugin-extension';
import ThemeExtension from './theme-extension';

const createExtension = (pkg, data) => {
    if (pkg.pkg && !data) {
        data = pkg.data;
        pkg = pkg.pkg;
    }

    switch (pkg.type) {
    case TYPES.app:
        return new AppExtension(pkg, data);
    case TYPES.plugin:
        return new PluginExtension(pkg, data);
    case TYPES.theme:
        return new ThemeExtension(pkg, data);
    default:
        return new Extension(pkg, data);
    }
};

export {AppExtension, PluginExtension, ThemeExtension, createExtension};
export default Extension;
