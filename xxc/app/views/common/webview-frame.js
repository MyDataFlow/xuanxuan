import React, {Component, PropTypes} from 'react';
import {classes} from '../../utils/html-helper';
import WebView from './webview';
import Avatar from '../../components/avatar';
import Icon from '../../components/icon';

export default class WebViewFrame extends Component {
    static get WebViewFrame() {
        return replaceViews('common/webview-frame', WebViewFrame);
    }

    static propTypes = {
        className: PropTypes.string,
        onLoadingChange: PropTypes.func,
        onPageTitleUpdated: PropTypes.func,
        options: PropTypes.object,
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
            title: this.props.src,
            favicon: 'mdi-web',
            loading: false
        };
    }

    componentDidMount() {
        const webview = this.webview.webview;
        webview.addEventListener('page-favicon-updated', this.handleFaviconUpdated);
    }

    reloadWebview() {
        if (this.webviewId) {
            const webview = document.getElementById(this.webviewId);
            webview.reload();
        }
    }

    handleFaviconUpdated = e => {
        if (e.favicons && e.favicons.length) {
            this.setState({favicon: e.favicons[0]});
        }
    };

    handlePageTitleChange = (title, explicitSet) => {
        const {onPageTitleUpdated} = this.props;
        if (title !== this.state.title) {
            this.setState({title: title});
        }
        if (onPageTitleUpdated) {
            onPageTitleUpdated(title, explicitSet);
        }
    };

    handleLoadingChange = (loading, ...params) => {
        this.setState({loading});
        const {onLoadingChange} = this.props;
        if (onLoadingChange) {
            onLoadingChange(loading, ...params);
        }
    };

    handleReloadBtnClick = () => {
        this.setState({loading: true}, () => {
            this.webview.reloadWebview();
        });
    };

    handleStopBtnClick = () => {
        if (this.webview && this.webview.webview) {
            this.webview.webview.stop();
        }
    };

    handleGoBackBtnClick = () => {
        if (this.webview && this.webview.webview) {
            this.webview.webview.goBack();
        }
    };

    handleGoForwardBtnClick = () => {
        if (this.webview && this.webview.webview) {
            this.webview.webview.goForward();
        }
    };

    render() {
        let {
            className,
            onLoadingChange,
            onPageTitleUpdated,
            src,
            options,
            ...other
        } = this.props;
        const width = (options && options.width) || 860;
        const height = (options && options.height) || 640;

        const webview = this.webview && this.webview.webview;

        return (<div className={classes('webview-frame column', className)} {...other}>
            <div className="heading flex-none">
                {Avatar.render(this.state.loading ? 'mdi-loading spin muted' : this.state.favicon)}
                <div className="title">{this.state.title}</div>
                <nav className="nav" style={{marginRight: 40}}>
                    <a className={webview && webview.canGoBack() ? '' : 'disabled'} onClick={this.handleGoBackBtnClick}>{Icon.render('arrow-left')}</a>
                    <a className={webview && webview.canGoForward() ? '' : 'disabled'} onClick={this.handleGoForwardBtnClick}>{Icon.render('arrow-right')}</a>
                    {this.state.loading ? <a onClick={this.handleStopBtnClick}>{Icon.render('close-circle-outline')}</a> : <a onClick={this.handleReloadBtnClick}>{Icon.render('reload')}</a>}
                </nav>
            </div>
            <WebView ref={e => this.webview = e} className="flex-auto relative" src={src} {...options} style={{width, height}} onLoadingChange={this.handleLoadingChange} onPageTitleUpdated={this.handlePageTitleChange} />
        </div>)
    }
}
