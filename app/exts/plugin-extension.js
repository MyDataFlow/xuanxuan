import Path from 'path';
import Extension from './base-extension';

export default class PluginExtension extends Extension {
    constructor(pkg, data) {
        super(pkg, data);

        if (!this.isPlugin) {
            throw new Error(`Cannot create a plugin extension from the type '${this.type}'.`);
        }

        if (!pkg.main && !(pkg.buildIn && pkg.buildIn.module)) {
            this.pkg.main = 'index.js';
            this.addError('main', 'The main attribute must be set when the extension type is plugin, set to "index.js" temporarily.');
        }
    }
}
