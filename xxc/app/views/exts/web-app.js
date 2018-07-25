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

    constructor(props) {
        super(props);
        const {app} = this.props;
        const {hasServerEntry} = app.app;
        this.state = {
            url: hasServerEntry ? null : (app.directUrl || app.app.webViewUrl),
            loading: hasServerEntry
        };
    }

    componentDidMount() {
        const {app} = this.props;
        if (this.webview) {
            app.webview = this.webview.webview;
        }
        const {loading} = this.state;
        if (loading) {
            app.app.getEntryUrl().then(url => {
                this.setState({url, loading: false});
            }).catch(_ => {
                this.setState({loading: false});
            });
        }
    }

    componentDidUpdate() {
        if (this.webview) {
            this.props.app.webview = this.webview.webview;
        }
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

        const {url, loading} = this.state;
        let webView = null;
        if (url) {
            const nodeintegration = app.app.isLocalWebView;
            const preload = app.app.webViewPreloadScript;
            const {injectScript, injectCSS} = app.app;
            webView = <WebView ref={e => {this.webview = e;}} className="dock scroll-none" src={url} onLoadingChange={onLoadingChange} onPageTitleUpdated={this.handleOnPageTitleUpdated} nodeintegration={nodeintegration} preload={preload} insertCss={injectCSS} executeJavaScript={injectScript} />;
        }

        return (
            <div className={classes('app-web-app load-indicator', className, {loading})}>
                {webView}
            </div>
        );
    }
}
