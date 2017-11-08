import Extension from './base-extension';

export default class ThemeExtension extends Extension {
    constructor(pkg, data) {
        super(pkg, data);

        if (!this.isTheme) {
            throw new Error(`Cannot create a theme extension from the type '${this.type}'.`);
        }

        this._themes = this._pkg.themes;
        if (!this._themes || !this._themes.length) {
            this.addError('themes', 'At least one theme must be set in the theme extension.');
        }
    }

    get themes() {
        return this._themes;
    }

    getTheme(name) {
        return this.themes.find(x => x.name === name);
    }
}
