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

    render() {
        const {
            className,
            app,
            onLoadingChange,
            onPageTitleUpdated,
        } = this.props;

        const nodeintegration = app.app.isLocalWebView;
        const preload = app.app.webViewPreloadScript;

        return (<div className={HTML.classes('app-web-app', className)}>
            <WebView className="dock scroll-none" src={app.app.webViewUrl} onLoadingChange={onLoadingChange} onPageTitleUpdated={onPageTitleUpdated} nodeintegration={nodeintegration} preload={preload} />
        </div>);
    }
}
