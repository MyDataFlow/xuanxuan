import React, {Component, PropTypes} from 'react';
import {NavLink, Redirect} from 'react-router-dom';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import ROUTES from '../common/routes';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Messager from '../../components/messager';
import Exts from '../../exts';
import {WebApp} from './web-app';
import {AppHome} from './app-home';
import {AppExtensions} from './app-extensions';
import {AppFiles} from './app-files';
import {AppThemes} from './app-themes';
import replaceViews from '../replace-views';
import App from '../../core';

const buildInView = {
    home: AppHome,
    extensions: AppExtensions,
    files: AppFiles,
    themes: AppThemes
};

export default class Index extends Component {
    static get Index() {
        return replaceViews('exts/index', Index);
    }

    static propTypes = {
        match: PropTypes.object.isRequired,
        hidden: PropTypes.bool,
        className: PropTypes.string,
    };

    static defaultProps = {
        hidden: false,
        className: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            navScrolled: false,
            loading: {}
        };
    }

    componentDidMount() {
        this.checkAppNotFoundMessage();
        this.checkScrollToCurrentApp();
    }

    componentDidUpdate() {
        this.checkAppNotFoundMessage();
        this.checkScrollToCurrentApp();
    }

    checkAppNotFoundMessage() {
        if (this.appNotFound) {
            Messager.show(Lang.format('exts.appNotFound.format', this.appNotFound), {type: 'warning', position: 'center'});
            this.appNotFound = null;
        }
    }

    handleWheelEvent = e => {
        e.currentTarget.scrollLeft += e.deltaY;
    }

    checkScrollToCurrentApp() {
        const hasScrollbar = this.appsNav.scrollWidth > this.appsNav.clientWidth;
        if (this.state.navScrolled !== hasScrollbar) {
            this.setState({navScrolled: hasScrollbar});
        } else {
            const currentOpenedApp = Exts.ui.currentOpenedApp;
            if (currentOpenedApp) {
                const navEle = document.getElementById(`ext-nav-item-${currentOpenedApp.name}`);
                if (navEle) {
                    navEle.scrollIntoViewIfNeeded();
                }
            }
        }
    }

    handleAppCloseBtnClick = e => {
        const result = Exts.ui.closeApp(e.currentTarget.attributes['data-id'].value);
        if (result === 'refresh') {
            this.forceUpdate();
        }
        e.stopPropagation();
        e.preventDefault();
    }

    handleNavArrowClick(direction) {
        this.appsNav.scrollLeft += (direction === 'left' ? -1 : 1) * Math.min(150, Math.floor(this.appsNav.clientWidth / 2));
    }

    handleAppLoadingChange(openApp, isLoading) {
        const {loading} = this.state;
        loading[openApp.id] = isLoading;
        this.setState({loading});
    }

    handleOpenedAppContextMenu(openedApp, e) {
        const menuItems = Exts.ui.createOpenedAppContextMenu(openedApp, () => {
            this.forceUpdate();
        });
        if (menuItems && menuItems.length) {
            App.ui.showContextMenu({x: e.clientX, y: e.clientY, target: e.target}, menuItems);
            e.preventDefault();
            e.stopPropagation();
        }
    }

    render() {
        const {
            hidden,
            className,
            match
        } = this.props;

        const openedApps = Exts.ui.openedApps;

        let redirectView = null;
        if (match.url.startsWith(ROUTES.exts._)) {
            if (!match.params.filterType || !match.params.id) {
                redirectView = <Redirect to={ROUTES.exts.app.id(Exts.ui.currentOpenedApp.name)} />;
            } else if (match.params.id && !Exts.ui.openAppById(match.params.id, match.params.params)) {
                this.appNotFound = match.params.id;
                redirectView = <Redirect to={ROUTES.exts.app.id(Exts.ui.defaultApp.name)} />;
            }
        }

        return (<div className={HTML.classes('app-exts dock column single', /* 'app-exts-dark', */ `app-exts-current-${Exts.ui.currentOpenedApp.name}`, className, {hidden})}>
            <nav
                className={HTML.classes('app-exts-nav nav flex-none', {'app-exts-nav-compact': openedApps.length > 7, 'app-exts-nav-scrolled': this.state.navScrolled})}
                onWheel={this.handleWheelEvent}
                ref={e => {this.appsNav = e;}}
            >
                {
                    openedApps.map(openedApp => {
                        const isCurrentApp = Exts.ui.isCurrentOpenedApp(openedApp.id);
                        return (<NavLink
                            onContextMenu={this.handleOpenedAppContextMenu.bind(this, openedApp)}
                            key={openedApp.id}
                            to={openedApp.routePath}
                            className={`ext-nav-item-${openedApp.appName}`}
                            id={`ext-nav-item-${openedApp.name}`}
                            title={openedApp.app.description ? `${openedApp.app.displayName} - ${openedApp.app.description}` : openedApp.app.displayName}
                        >
                            <Avatar foreColor={isCurrentApp ? openedApp.app.appAccentColor : null} auto={openedApp.app.appIcon} className="rounded" />
                            {this.state.loading[openedApp.id] && <Avatar icon="loading spin" className="circle loading-icon" />}
                            <span className="text">{openedApp.app.displayName}</span>
                            {!openedApp.isFixed && <div title={Lang.string('common.close')} className="close rounded"><Icon data-id={openedApp.id} name="close" onClick={this.handleAppCloseBtnClick} /></div>}
                        </NavLink>);
                    })
                }
                <div className="app-exts-nav-arrows nav">
                    <a className="app-exts-nav-arrow-left" onClick={this.handleNavArrowClick.bind(this, 'left')}><Icon name="menu-left icon-2x" /></a>
                    <a className="app-exts-nav-arrow-right" onClick={this.handleNavArrowClick.bind(this, 'right')}><Icon name="menu-right icon-2x" /></a>
                </div>
            </nav>
            <div className="app-exts-apps flex-auto">
                {
                    openedApps.map(openedApp => {
                        let appView = null;
                        if (openedApp.app.MainView) {
                            appView = <openedApp.app.MainView app={openedApp} />;
                        } else if (openedApp.app.buildIn && buildInView[openedApp.id]) {
                            const TheAppView = buildInView[openedApp.id];
                            appView = TheAppView && <TheAppView app={openedApp} />;
                        } else {
                            const webViewUrl = openedApp.app.webViewUrl;
                            if (webViewUrl) {
                                appView = <WebApp onLoadingChange={this.handleAppLoadingChange.bind(this, openedApp)} app={openedApp} />;
                            }
                        }
                        if (!appView) {
                            appView = <div className="box">{Lang.string('exts.appNoView')}({openedApp.id})</div>;
                        }
                        return (<div
                            key={openedApp.id}
                            className={HTML.classes(`app-exts-app app-exts-app-${openedApp.id} dock scroll-y`, {hidden: !Exts.ui.isCurrentOpenedApp(openedApp.id)})}
                            style={{backgroundColor: openedApp.app.appBackColor}}
                        >{appView}</div>);
                    })
                }
            </div>
            {redirectView}
        </div>);
    }
}
