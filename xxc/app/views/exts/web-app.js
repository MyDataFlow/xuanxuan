import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
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

    componentDidMount() {
        this.props.app.webview = this.webview.webview;
    }

    handleOnPageTitleUpdated = (title, explicitSet) => {
        const {onPageTitleUpdated, app} = this.props;
        if (onPageTitleUpdated) {
            onPageTitleUpdated(explicitSet ? `${app.app.displayName} (${title})` : '');
        }
    };

    render() {
        const {
            className,
            app,
            onLoadingChange,
        } = this.props;

        const nodeintegration = app.app.isLocalWebView;
        const preload = app.app.webViewPreloadScript;
        const injectScript = app.app.injectScript;
        const injectCSS = app.app.injectCSS;

        return (<div className={classes('app-web-app', className)}>
            <WebView ref={e => {this.webview = e;}} className="dock scroll-none" src={app.directUrl || app.app.webViewUrl} onLoadingChange={onLoadingChange} onPageTitleUpdated={this.handleOnPageTitleUpdated} nodeintegration={nodeintegration} preload={preload} insertCss={injectCSS} executeJavaScript={injectScript} />
        </div>);
    }
}
