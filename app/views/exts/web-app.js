import React, {Component, PropTypes} from 'react';
import Platform from 'Platform';
import HTML from '../../utils/html-helper';
import OpenedApp from '../../exts/opened-app';
import timeSequence from '../../utils/time-sequence';
import replaceViews from '../replace-views';

const isNWJS = Platform.type === 'nwjs';

export default class WebApp extends Component {
    static get WebApp() {
        return replaceViews('exts/web-app', WebApp);
    }

    static propTypes = {
        app: PropTypes.instanceOf(OpenedApp).isRequired,
        className: PropTypes.string,
        onLoadingChange: PropTypes.func,
        onPageTitleChange: PropTypes.func,
    };

    static defaultProps = {
        className: null,
        onLoadingChange: null,
        onPageTitleChange: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            errorCode: null,
            errorDescription: null
        };
        this.webviewId = `webview-${timeSequence()}`;
    }

    componentDidMount() {
        const webview = document.getElementById(this.webviewId);
        webview.addEventListener('did-start-loading', this.handleLoadingStart);
        webview.addEventListener('did-finish-load', this.handleLoadingStop);
        webview.addEventListener('page-title-updated', this.handlePageTitleChange);
        webview.addEventListener('did-fail-load', this.handleLoadFail);
        webview.addEventListener('new-window', this.handleNewWindow);
    }

    componentWillUnmount() {
        const webview = document.getElementById(this.webviewId);
        webview.removeEventListener('did-start-loading', this.handleLoadingStart);
        webview.removeEventListener('did-finish-load', this.handleLoadingStop);
        webview.removeEventListener('page-title-updated', this.handlePageTitleChange);
        webview.removeEventListener('did-fail-load', this.handleLoadFail);
        webview.removeEventListener('new-window', this.handleNewWindow);
    }

    reloadWebview() {
        const webview = document.getElementById(this.webviewId);
        webview.reload();
    }

    handleNewWindow = e => {
        if (Platform.ui.openExternal) {
            Platform.ui.openExternal(e.url);
        }
    };

    handlePageTitleChange = e => {
        const {onPageTitleChange} = this.props;
        if (onPageTitleChange) {
            onPageTitleChange(e.title, e.explicitSet);
        }
    };

    handleLoadingStart = () => {
        const {onLoadingChange, app} = this.props;
        app.webview = document.getElementById(this.webviewId);
        if (onLoadingChange) {
            onLoadingChange(true);
        }
        this.setState({
            errorCode: null,
            errorDescription: null
        });
    };

    handleLoadFail = (errorCode, errorDescription, validatedURL) => {
        const {onLoadingChange} = this.props;
        if (onLoadingChange) {
            onLoadingChange(false, errorCode, errorDescription, validatedURL);
        }
        this.setState({
            errorCode, errorDescription
        });
    };

    handleLoadingStop = () => {
        const {onLoadingChange} = this.props;
        if (onLoadingChange) {
            onLoadingChange(false);
        }
    };

    render() {
        const {
            className,
            app,
            onLoadingChange,
            onPageTitleChange,
        } = this.props;

        const webviewHtml = isNWJS ? `<iframe id="${this.webviewId}" src="${app.app.webViewUrl}" scrolling="auto" allowtransparency="true" hidefocus frameborder="0" class="dock fluid-v fluid" />` : `<webview id="${this.webviewId}" src="${app.app.webViewUrl}" class="dock fluid-v fluid" ${app.app.isLocalWebView ? 'nodeintegration' : ''} />`;

        return (<div className={HTML.classes('app-web-app', className)}>
            <div className="dock scroll-none" dangerouslySetInnerHTML={{__html: webviewHtml}} />
            {this.state.errorCode && <div className="dock box">
                <h1>{this.state.errorCode}</h1>
                <div>{this.state.errorDescription}</div>
            </div>}
        </div>);
    }
}
