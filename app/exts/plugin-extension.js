import Path from 'path';
import Extension from './base-extension';

export default class PluginExtension extends Extension {
    constructor(pkg, data) {
        super(pkg, data);

        if (!this.isPlugin) {
            throw new Error(`Cannot create a plugin extension from the type '${this.type}'.`);
        }

        if (!pkg.main) {
            this.addError('main', 'The main attribute must be set when the extension type is plugin, set to "index.js" temporarily.');
        }
    }

    get mainFile() {
        const mainFile = this.pkg.main || 'index.js';
        if (mainFile && !this._mainFile) {
            this._mainFile = Path.join(this.localPath, mainFile);
        }
        return this._mainFile;
    }
}
