import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import {AppExtension} from '../../exts/extension';
import { fail } from 'assert';

export default class WebApp extends Component {
    static propTypes = {
        app: PropTypes.instanceOf(AppExtension).isRequired,
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
    }

    componentDidMount() {
        this.webview.addEventListener('did-start-loading', this.handleLoadingStart);
        this.webview.addEventListener('did-finish-load', this.handleLoadingStop);
        this.webview.addEventListener('page-title-updated', this.handlePageTitleChange);
        this.webview.addEventListener('did-fail-load', this.handleLoadFail);
    }

    componentWillUnmount() {
        this.webview.removeEventListener('did-start-loading', this.handleLoadingStart);
        this.webview.removeEventListener('did-finish-load', this.handleLoadingStop);
        this.webview.removeEventListener('page-title-updated', this.handlePageTitleChange);
        this.webview.removeEventListener('did-fail-load', this.handleLoadFail);
    }

    reloadWebview() {
        this.webview.reload();
    }

    handlePageTitleChange = (title, explicitSet) => {
        const {onPageTitleChange} = this.props;
        if (onPageTitleChange) {
            onPageTitleChange(title, explicitSet);
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

        return (<div className={HTML.classes('app-web-app', className)}>
            <webview ref={e => {this.webview = e;}} src={app.webViewUrl} className="dock" />
            {this.state.errorCode && <div className="dock box">
                <h1>{this.state.errorCode}</h1>
                <div>{this.state.errorDescription}</div>
            </div>}
        </div>);
    }
}
