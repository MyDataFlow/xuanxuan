import React, {Component, PropTypes} from 'react';
import Platform from 'Platform';
import {classes} from '../../utils/html-helper';
import timeSequence from '../../utils/time-sequence';
import replaceViews from '../replace-views';

const isElectron = Platform.type === 'electron';

export default class WebView extends Component {
    static get WebView() {
        return replaceViews('common/webview', WebView);
    }

    static propTypes = {
        className: PropTypes.string,
        onLoadingChange: PropTypes.func,
        onPageTitleUpdated: PropTypes.func,
        src: PropTypes.string.isRequired,
        insertCss: PropTypes.string,
        executeJavaScript: PropTypes.string,
        onExeCuteJavaScript: PropTypes.func,
        onDomReady: PropTypes.func,
    };

    static defaultProps = {
        className: null,
        onLoadingChange: null,
        onPageTitleUpdated: null,
        insertCss: null,
        executeJavaScript: null,
        onExeCuteJavaScript: null,
        onDomReady: null,
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
        const webview = this.webview;
        webview.addEventListener('did-start-loading', this.handleLoadingStart);
        webview.addEventListener('did-finish-load', this.handleLoadingStop);
        webview.addEventListener('page-title-updated', this.handlePageTitleChange);
        webview.addEventListener('did-fail-load', this.handleLoadFail);
        webview.addEventListener('new-window', this.handleNewWindow);
        webview.addEventListener('dom-ready', this.handleDomReady);

        const {insertCss, executeJavaScript, onExeCuteJavaScript} = this.props;
        if (insertCss) {
            webview.insertCSS(insertCss);
        }
        if (executeJavaScript) {
            webview.executeJavaScript(executeJavaScript, false, onExeCuteJavaScript);
        }
    }

    componentWillUnmount() {
        const webview = this.webview;
        if (webview) {
            webview.removeEventListener('did-start-loading', this.handleLoadingStart);
            webview.removeEventListener('did-finish-load', this.handleLoadingStop);
            webview.removeEventListener('page-title-updated', this.handlePageTitleChange);
            webview.removeEventListener('did-fail-load', this.handleLoadFail);
            webview.removeEventListener('new-window', this.handleNewWindow);
        }
    }

    get webview() {
        return document.getElementById(this.webviewId);
    }

    reloadWebview() {
        const webview = this.webview;
        webview.reload();
    }

    handleNewWindow = e => {
        if (Platform.ui.openExternal) {
            Platform.ui.openExternal(e.url);
        }
    };

    handlePageTitleChange = e => {
        const {onPageTitleUpdated} = this.props;
        if (onPageTitleUpdated) {
            onPageTitleUpdated(e.title, e.explicitSet);
        }
    };

    handleLoadingStart = () => {
        const {onLoadingChange} = this.props;
        if (onLoadingChange) {
            onLoadingChange(true);
        }
        this.setState({
            errorCode: null,
            errorDescription: null
        });
    };

    handleLoadFail = (e) => {
        const {errorCode, errorDescription, validatedURL} = e;
        const {onLoadingChange} = this.props;
        if (onLoadingChange) {
            onLoadingChange(false, errorCode, errorDescription, validatedURL);
        }
        this.setState({
            errorCode, errorDescription
        });
        if (DEBUG) {
            console.error('Cannot load webview', e);
        }
    };

    handleLoadingStop = () => {
        const {onLoadingChange} = this.props;
        if (onLoadingChange) {
            onLoadingChange(false);
        }
    };

    handleDomReady = () => {
        const {onDomReady} = this.props;
        if (onDomReady) {
            onDomReady();
        }
    };

    render() {
        const {
            className,
            onLoadingChange,
            onPageTitleUpdated,
            src,
            style,
            ...options
        } = this.props;

        let webviewHtml;
        if (this.state.errorCode) {
            webviewHtml = `<div class="dock box danger"><h1>${this.state.errorCode}</h1><div>${this.state.errorDescription}</div></div>`
        } else if (isElectron) {
            webviewHtml = `<webview id="${this.webviewId}" src="${src}" class="dock fluid-v fluid" ${options && options.nodeintegration ? 'nodeintegration' : ''} ${options && options.preload ? (' preload="' + options.preload + '"') : ''} />`;
        } else {
            webviewHtml = `<iframe id="${this.webviewId}" src="${src}" scrolling="auto" allowtransparency="true" hidefocus frameborder="0" class="dock fluid-v fluid" />`;
        }

        return (<div className={classes('webview', className)} dangerouslySetInnerHTML={{__html: webviewHtml}} style={style} />);
    }
}
