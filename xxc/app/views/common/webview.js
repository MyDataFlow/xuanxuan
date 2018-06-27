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
    };

    static defaultProps = {
        className: null,
        onLoadingChange: null,
        onPageTitleUpdated: null,
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
        const {onPageTitleUpdated} = this.props;
        if (onPageTitleUpdated) {
            onPageTitleUpdated(e.title, e.explicitSet);
        }
    };

    handleLoadingStart = () => {
        const {onLoadingChange} = this.props;
        if (onLoadingChange) {
            onLoadingChange(document.getElementById(this.webviewId));
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
            onLoadingChange,
            onPageTitleUpdated,
            src,
            ...options
        } = this.props;

        let webviewHtml;
        if (isElectron) {
            webviewHtml = `<webview id="${this.webviewId}" src="${src}" class="dock fluid-v fluid" ${options && options.nodeintegration ? 'nodeintegration' : ''} ${options && options.preload ? (' preload="' + options.preload + '"') : ''} />`;
        } else {
            webviewHtml = `<iframe id="${this.webviewId}" src="${src}" scrolling="auto" allowtransparency="true" hidefocus frameborder="0" class="dock fluid-v fluid" />`;
        }

        return (<div className={classes('webview', className)} dangerouslySetInnerHTML={{__html: webviewHtml}}>
            {this.state.errorCode && (<div className="dock box">
                <h1>{this.state.errorCode}</h1>
                <div>{this.state.errorDescription}</div>
            </div>)}
        </div>);
    }
}
