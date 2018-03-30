import Extension from './base-extension';
import Theme from './theme';

export default class ThemeExtension extends Extension {
    constructor(pkg, data) {
        super(pkg, data);

        if (!this.isTheme) {
            throw new Error(`Cannot create a theme extension from the type '${this.type}'.`);
        }

        const themes = this._pkg.themes;
        if (themes && themes.length) {
            this._themes = themes.map(themeData => {
                return new Theme(themeData, this);
            });
        } else {
            this._themes = [];
            this.addError('themes', 'At least one theme must be set with "themes" attribute in package.json for theme extension.');
        }
    }

    get themes() {
        return this._themes;
    }

    getTheme(name) {
        return this.themes.find(x => x.name === name);
    }
}
