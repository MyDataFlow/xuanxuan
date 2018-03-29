import Path from 'path';
import Extension from './base-extension';

export const APP_TYPES = {
    insideView: 'insideView',
    webView: 'webView'
};

export default class AppExtension extends Extension {
    constructor(pkg, data) {
        super(pkg, data);

        if (!this.isApp) {
            throw new Error(`Cannot create a app extension from the type '${this.type}'.`);
        }

        this._appType = APP_TYPES[pkg.appType];
        if (!this._appType) {
            this._appType = pkg.webViewUrl ? APP_TYPES.webView : APP_TYPES.insideView;
            this.addError('appType', `AppType (${pkg.appType}) must be one of '${Object.keys(APP_TYPES).join(',')}', set to ‘${this._appType}’ temporarily.`);
        }

        if (this._appType === APP_TYPES.webView && !pkg.webViewUrl) {
            this.addError('webViewUrl', 'The webViewUrl attribute must be set when appType is \'webView\'.');
        }
    }

    get isWebview() {
        return this._appType === APP_TYPES.webView;
    }

    get appType() {
        return this._appType;
    }

    get webViewUrl() {
        if (this._appType !== APP_TYPES.webView) {
            return null;
        }
        const webViewUrl = this._pkg.webViewUrl;
        if (webViewUrl && !this._webViewUrl) {
            if (!webViewUrl.startsWith('http://') && !webViewUrl.startsWith('https://')) {
                this._isLocalWebView = true;
                this._webViewUrl = Path.join(this.localPath, webViewUrl);
            } else {
                this._isLocalWebView = false;
                this._webViewUrl = webViewUrl;
            }
        }
        return this._webViewUrl;
    }

    get isLocalWebView() {
        const webViewUrl = this.webViewUrl; // this line can ensure _isLocalWebView be set value
        return this._isLocalWebView;
    }

    get appAccentColor() {return this._pkg.appAccentColor || this._pkg.accentColor;}
    get appBackColor() {return this._pkg.appBackColor;}

    get appIcon() {
        const appIcon = this._pkg.appIcon;
        if (appIcon && !this._appIcon) {
            if (appIcon.length > 1 && !appIcon.startsWith('http://') && !appIcon.startsWith('https://') && !appIcon.startsWith('mdi-') && !appIcon.startsWith('icon')) {
                this._appIcon = Path.join(this.localPath, appIcon);
            } else {
                this._appIcon = appIcon;
            }
        }
        return this._appIcon || super.icon;
    }

    get icon() {return this._pkg.icon ? super.icon : this.appIcon;}
    get accentColor() {return this._pkg.accentColor || this._pkg.appAccentColor;}

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
