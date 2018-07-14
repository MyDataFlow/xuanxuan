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
        onNavigate: PropTypes.func,
        onDomReady: PropTypes.func,
        injectForm: PropTypes.any,
        useMobileAgent: PropTypes.bool,
        hideBeforeDOMReady: PropTypes.bool,
        style: PropTypes.object,
    };

    static defaultProps = {
        className: null,
        onLoadingChange: null,
        onPageTitleUpdated: null,
        insertCss: null,
        executeJavaScript: null,
        onExeCuteJavaScript: null,
        onNavigate: null,
        injectForm: null,
        onDomReady: null,
        useMobileAgent: false,
        hideBeforeDOMReady: true,
        style: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            errorCode: null,
            errorDescription: null,
            domReady: false
        };
        this.webviewId = `webview-${timeSequence()}`;
    }

    componentDidMount() {
        const webview = this.webview;
        webview.addEventListener('did-start-loading', this.handleLoadingStart);
        webview.addEventListener('did-finish-load', this.handleLoadingStop);
        webview.addEventListener('did-stop-loading', this.handleLoadingStop);
        webview.addEventListener('page-title-updated', this.handlePageTitleChange);
        webview.addEventListener('did-fail-load', this.handleLoadFail);
        webview.addEventListener('new-window', this.handleNewWindow);
        webview.addEventListener('dom-ready', this.handleDomReady);
        webview.addEventListener('will-navigate', this.handleWillNavigate);
    }

    componentWillUnmount() {
        const webview = this.webview;
        if (webview) {
            webview.removeEventListener('did-start-loading', this.handleLoadingStart);
            webview.removeEventListener('did-finish-load', this.handleLoadingStop);
            webview.removeEventListener('did-stop-loading', this.handleLoadingStop);
            webview.removeEventListener('page-title-updated', this.handlePageTitleChange);
            webview.removeEventListener('did-fail-load', this.handleLoadFail);
            webview.removeEventListener('new-window', this.handleNewWindow);
            webview.removeEventListener('dom-ready', this.handleDomReady);
            webview.removeEventListener('will-navigate', this.handleWillNavigate);
        }
    }

    get webview() {
        return document.getElementById(this.webviewId);
    }

    reloadWebview() {
        const webview = this.webview;
        return webview && webview.reload();
    }

    handleWillNavigate = e => {
        const {onNavigate} = this.props;
        if (onNavigate) {
            onNavigate(e.url, e);
        }
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
            errorDescription: null,
            domReady: false
        });
    };

    handleLoadFail = (e) => {
        const {errorCode, errorDescription, validatedURL} = e;
        const {onLoadingChange} = this.props;
        if (onLoadingChange) {
            onLoadingChange(false, errorCode, errorDescription, validatedURL);
        }
        this.setState({
            errorCode,
            errorDescription,
            domReady: true,
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
        const webview = this.webview;
        const {onDomReady} = this.props;
        const {insertCss, executeJavaScript, onExeCuteJavaScript} = this.props;
        if (insertCss) {
            webview.insertCSS(insertCss);
            if (DEBUG) {
                console.log('Webview.insertCSS', insertCss);
            }
        }
        if (executeJavaScript) {
            webview.executeJavaScript(executeJavaScript, false, onExeCuteJavaScript);
            if (DEBUG) {
                console.log('Webview.executeJavaScript', executeJavaScript);
            }
        }
        let {injectForm} = this.props;
        if (injectForm) {
            if (typeof injectForm === 'string') {
                injectForm = JSON.parse(injectForm);
            }
            const injectScriptLines = ['(function(){'];
            Object.keys(injectForm).forEach((key, index) => {
                if (key && key[0] !== '$') {
                    let keyValue = injectForm[key];
                    if (keyValue) {
                        keyValue = keyValue.replace(/`/g, '\\`');
                    }
                    injectScriptLines.push(
                        `document.querySelectorAll('${key}').forEach(ele => {if(ele.tagName === 'INPUT' || ele.tagName === 'SELECT' || ele.tagName === 'TEXTAREA') {ele.value = \`${keyValue}\`;}});`
                    );
                }
            });
            ['click', 'submit', 'focus', 'input', 'paste'].forEach(key => {
                const eventSelector = injectForm[`$${key}`];
                if (eventSelector) {
                    injectScriptLines.push(
                        `document.querySelectorAll('${eventSelector}').forEach(ele => {ele.dispatchEvent(new Event('${key}'));});`
                    );
                }
            });

            injectScriptLines.push('}());');
            const injectScriptCode = injectScriptLines.join('\n');
            if (DEBUG) {
                console.log('Webview.injectForm', {injectForm, injectScriptCode});
            }
            webview.executeJavaScript(injectScriptCode, false, () => {
                if (DEBUG) {
                    console.log('Webview.injectForm.finish', injectForm);
                }
            });
        }
        if (onDomReady) {
            onDomReady();
        }

        const {contextmenu} = Platform;
        if (contextmenu && (contextmenu.showInputContextMenu || contextmenu.showSelectionContextMenu)) {
            const webContents = webview.getWebContents();
            if (webContents) {
                webContents.on('context-menu', (e, props) => {
                    const {selectionText, isEditable} = props;
                    if (isEditable) {
                        if (contextmenu.showInputContextMenu) {
                            contextmenu.showInputContextMenu();
                        }
                    } else if (selectionText && selectionText.trim() !== '') {
                        if (contextmenu.showSelectionContextMenu) {
                            contextmenu.showSelectionContextMenu();
                        }
                    }
                });
            }
        }

        this.setState({domReady: true});
    };

    render() {
        const {
            className,
            onLoadingChange,
            onPageTitleUpdated,
            src,
            style,
            useMobileAgent,
            hideBeforeDOMReady,
            ...options
        } = this.props;

        let webviewHtml;
        if (this.state.errorCode) {
            webviewHtml = `<div class="dock box danger"><h1>${this.state.errorCode}</h1><div>${this.state.errorDescription}</div></div>`;
        } else if (isElectron) {
            webviewHtml = `<webview id="${this.webviewId}" src="${src}" class="dock fluid-v fluid" ${options && options.nodeintegration ? 'nodeintegration' : ''} ${options && options.preload ? (` preload="${options.preload}"`) : ''} />`;
        } else {
            webviewHtml = `<iframe id="${this.webviewId}" src="${src}" scrolling="auto" allowtransparency="true" hidefocus frameborder="0" class="dock fluid-v fluid" />`;
        }

        return (<div
            className={classes('webview relative fade', className, {in: !hideBeforeDOMReady || this.state.domReady})}
            dangerouslySetInnerHTML={{__html: webviewHtml}} // eslint-disable-line
            style={style}
        />);
    }
}
