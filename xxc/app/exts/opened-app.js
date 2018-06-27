import Platform from 'Platform';
import StringHelper from '../utils/string-helper';
import HTML from '../utils/html-helper';

/**
 * 打开的应用实例 ID
 */
export default class OpenedApp {
    /**
     * 创建打开的应用实例 ID
     */
    static createId = (name, pageName) => {
        return pageName ? `${name}@${pageName}` : name;
    };

    /**
     * 创建一个打开的应用实例
     *
     * @param {AppExtension} app 要打开的应用实例
     * @param {String} pageName 子界面名称
     * @param {?Object} params 界面访问参数
     */
    constructor(app, pageName = null, params = null) {
        this._app = app;
        this._pageName = pageName;
        this.params = params;

        const now = new Date().getTime();
        this._createTime = now;
        this._openTime = now;
    }

    /**
     * 获取应用打开的 ID
     */
    get id() {
        if (!this._id) {
            this._id = this._pageName ? `${this._app.name}@${this._pageName}` : this._app.name;
        }
        return this._id;
    }

    /**
     * 获取子界面名称
     */
    get pageName() {
        return this._pageName;
    }

    /**
     * 获取标识名称
     * @deprecated
     */
    get name() {
        return this.id;
    }

    /**
     * 获取应用对象
     */
    get app() {
        return this._app;
    }

    /**
     * 获取应用名
     */
    get appName() {
        return this._app.name;
    }

    /**
     * 获取在界面上显示的名称
     */
    get displayName() {
        return StringHelper.ifEmptyThen(this._displayName, this._app.displayName);
    }

    /**
     * 设置显示的名称
     */
    set displayName(displayName) {
        this._displayName = displayName;
    }

    /**
     * 获取上次打开的时间戳
     */
    get openTime() {
        return this._openTime;
    }

    /**
     * 获取第一次打开的时间戳
     */
    get createTime() {
        return this._createTime;
    }

    /**
     * 是否是固定的应用（无法被关闭）
     */
    get isFixed() {
        return this._app.isFixed;
    }

    /**
     * 是否是默认打开的应用
     */
    get isDefault() {
        return this._app.isDefault;
    }

    /**
     * 获取界面访问参数
     */
    get params() {
        return this._params;
    }

    /**
     * 设置应用访问的参数
     */
    set params(params) {
        if (typeof params === 'string') {
            params = HTML.getSearchParam(null, params);
        }
        this._params = params;
    }

    /**
     * 获取 Hash 格式的路由地址
     */
    get hashRoute() {
        return `#${this.routePath}`;
    }

    /**
     * 获取路由地址
     */
    get routePath() {
        let route = `/exts/app/${this.id}`;
        if (this.params) {
            const params = Object.keys(this.params).map(x => `${x}=${encodeURIComponent(this.params[x])}`).join('&');
            route += `/${params}`;
        }
        return route;
    }

    get directUrl() {
        const direct = this.params && this.params.DIRECT;
        return direct || this.app.webViewUrl;
    }

    /**
     * 更新最后打开的时间
     *
     * @param {Number} time
     */
    updateOpenTime(time) {
        this._openTime = time || new Date().getTime();
    }

    get webview() {
        return this._webview;
    }

    set webview(webview) {
        if (!this._webview && Platform.webview) {
            Platform.webview.initWebview(webview);
        }
        this._webview = webview;
    }
}
