import Extension from './base-extension';

export default class PluginExtension extends Extension {
    constructor(pkg, data) {
        super(pkg, data);

        if (!this.isPlugin) {
            throw new Error(`Cannot create a plugin extension from the type '${this.type}'.`);
        }
    }
}
