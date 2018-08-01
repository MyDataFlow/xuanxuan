import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import WebView from './webview';
import Avatar from '../../components/avatar';
import Icon from '../../components/icon';
import {openUrlInBrowser} from '../../core/ui';

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
        displayId: PropTypes.any
    };

    static defaultProps = {
        className: null,
        onLoadingChange: null,
        onPageTitleUpdated: null,
        options: null,
        displayId: null
    };

    constructor(props) {
        super(props);
        this.state = {
            title: this.props.src,
            favicon: 'mdi-web',
            loading: false,
            maximize: false
        };
    }

    componentDidMount() {
        const webview = this.webview.webview;
        if (webview) {
            webview.addEventListener('page-favicon-updated', this.handleFaviconUpdated);
        }
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

    handleOpenBtnClick = () => {
        if (this.webview && this.webview.webview) {
            openUrlInBrowser(this.webview.webview.getURL());
        } else {
            openUrlInBrowser(this.props.src);
        }
    };

    handleMaximizeBtnClick = () => {
        const {displayId} = this.props;
        if (displayId) {
            const displayEle = document.getElementById(displayId);
            if (displayEle) {
                displayEle.classList.toggle('fullscreen');
                this.setState({maximize: displayEle.classList.contains('fullscreen')});
            }
        }
    };

    handleDevBtnClick = () => {
        if (this.webview && this.webview.webview) {
            this.webview.webview.openDevTools();
        }
    };

    render() {
        let {
            className,
            onLoadingChange,
            onPageTitleUpdated,
            src,
            options,
            displayId,
            ...other
        } = this.props;

        const isMaximize = this.state.maximize;
        const webview = this.webview && this.webview.webview;

        return (<div className={classes('webview-frame column', className)} {...other}>
            <div className="heading flex-none shadow-2" style={{zIndex: 1031}}>
                {Avatar.render(this.state.loading ? 'mdi-loading spin muted' : this.state.favicon)}
                <div title={this.state.title} className="title text-ellipsis strong">{this.state.title}</div>
                <nav className="nav" style={{marginRight: 40}}>
                    {DEBUG ? <a onClick={this.handleDevBtnClick}>{Icon.render('auto-fix')}</a> : null}
                    <a onClick={this.handleOpenBtnClick}>{Icon.render('open-in-new')}</a>
                    <a className={webview && webview.canGoBack() ? '' : 'disabled'} onClick={this.handleGoBackBtnClick}>{Icon.render('arrow-left')}</a>
                    <a className={webview && webview.canGoForward() ? '' : 'disabled'} onClick={this.handleGoForwardBtnClick}>{Icon.render('arrow-right')}</a>
                    {this.state.loading ? <a onClick={this.handleStopBtnClick}>{Icon.render('close-circle-outline')}</a> : <a onClick={this.handleReloadBtnClick}>{Icon.render('reload')}</a>}
                    {displayId ? <a onClick={this.handleMaximizeBtnClick}>{Icon.render(isMaximize ? 'window-restore' : 'window-maximize')}</a> : null}
                </nav>
            </div>
            <WebView ref={e => {this.webview = e;}} className="flex-auto relative" src={src} {...options} onLoadingChange={this.handleLoadingChange} onPageTitleUpdated={this.handlePageTitleChange} />
        </div>);
    }
}
