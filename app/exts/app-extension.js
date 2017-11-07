import Extension from './base-extension';

export const APP_TYPES = {
    insideView: 'insideView',
    webView: 'webView'
};

export default class AppExtension extends Extension {
    constructor(pkg) {
        super(pkg);

        if (!this.isApp) {
            throw new Error(`Cannot create a app extension from the type '${this.type}'.`);
        }

        this._appType = APP_TYPES[pkg.appType];
        if (!this._appType) {
            this._appType = pkg.webViewUrl ? APP_TYPES.webView : pkg.webViewUrl.insideView;
            this.addError('appType', `AppType (${pkg.appType}) must be one of '${Object.keys(APP_TYPES).join(',')}', set to ‘${this._appType}’ temporarily.`);
        }

        if (this._appType === APP_TYPES.webView && !pkg.webViewUrl) {
            this.addError('webViewUrl', 'The webViewUrl attribute must be set when appType is \'webView\'.');
        }
    }

    get appType() {
        return this._appType;
    }

    get webViewUrl() {
        if (this._appType !== APP_TYPES.webView) {
            return null;
        }
        return this._pkg.webViewUrl;
    }

    get appIcon() {return this._pkg.appIcon;}
    get appAccentColor() {return this._pkg.appAccentColor;}
    get appBackColor() {return this._pkg.appBackColor;}

    get MainView() {
        const theModule = this.module;
        return theModule && theModule.MainView;
    }

    get buildIn() {
        return this._pkg.buildIn;
    }

    get isDefault() {
        const buildIn = this.buildIn;
        return buildIn && buildIn.asDefault;
    }

    get isFixed() {
        const buildIn = this.buildIn;
        return buildIn && (buildIn.asDefault || buildIn.fixed);
    }
}
