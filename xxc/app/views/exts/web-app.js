import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import OpenedApp from '../../exts/opened-app';
import replaceViews from '../replace-views';
import {WebView} from '../common/webview';

export default class WebApp extends Component {
    static get WebApp() {
        return replaceViews('exts/web-app', WebApp);
    }

    static propTypes = {
        app: PropTypes.instanceOf(OpenedApp).isRequired,
        className: PropTypes.string,
        onLoadingChange: PropTypes.func,
        onPageTitleUpdated: PropTypes.func,
    };

    static defaultProps = {
        className: null,
        onLoadingChange: null,
        onPageTitleUpdated: null,
    };

    handleOnPageTitleUpdated = (title, explicitSet) => {
        const {onPageTitleUpdated, app} = this.props;
        if (onPageTitleUpdated) {
            onPageTitleUpdated(explicitSet ? `${app.app.displayName} (${title})` : '');
        }
    };

    componentDidMount() {
        this.props.app.webview = this.webview.webview;
    }

    render() {
        const {
            className,
            app,
            onLoadingChange,
            onPageTitleUpdated,
        } = this.props;

        const nodeintegration = app.app.isLocalWebView;
        const preload = app.app.webViewPreloadScript;
        const injectScript = app.app.injectScript;
        const injectCSS = app.app.injectCSS;

        return (<div className={HTML.classes('app-web-app', className)}>
            <WebView ref={e => this.webview = e} className="dock scroll-none" src={app.directUrl || app.app.webViewUrl} onLoadingChange={onLoadingChange} onPageTitleUpdated={this.handleOnPageTitleUpdated} nodeintegration={nodeintegration} preload={preload} insertCss={injectCSS} executeJavaScript={injectScript} />
        </div>);
    }
}
