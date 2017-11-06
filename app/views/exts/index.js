import React, {Component, PropTypes} from 'react';
import {NavLink, Redirect} from 'react-router-dom';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import ROUTES from '../common/routes';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Messager from '../../components/messager';
import HomeView from './home';
import ExtensionsView from './extensions';
import Exts from '../../exts';

const buildInView = {
    home: HomeView,
    extensions: ExtensionsView
};

export default class ExtsIndexView extends Component {
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
            navScrolled: false
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

    handleAppCloseBtnClick(app, e) {
        const result = Exts.ui.closeApp(app.name);
        if (result === 'refresh') {
            this.forceUpdate();
        }
        e.stopPropagation();
        e.preventDefault();
    }

    handleNavArrowClick(direction) {
        this.appsNav.scrollLeft += (direction === 'left' ? -1 : 1) * Math.min(150, Math.floor(this.appsNav.clientWidth / 2));
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
            } else if (match.params.id && !Exts.ui.openApp(match.params.id)) {
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
                        const isCurrentApp = Exts.ui.isCurrentOpenedApp(openedApp.name);
                        const navId = `ext-nav-item-${openedApp.name}`;
                        const navStyle = isCurrentApp ? {color: openedApp.app.appAccentColor} : null;
                        return (<NavLink
                            key={openedApp.name}
                            to={ROUTES.exts.app.id(openedApp.name)}
                            className={navId}
                            id={navId}
                            title={openedApp.app.description ? `${openedApp.app.displayName} - ${openedApp.app.description}` : openedApp.app.displayName}
                        >
                            <Avatar style={navStyle} auto={openedApp.app.appIcon} className="rounded" />
                            <span className="text">{openedApp.app.displayName}</span>
                            {!openedApp.fixed && <div title={Lang.string('common.close')} className="close rounded"><Icon name="close" onClick={this.handleAppCloseBtnClick.bind(this, openedApp)} /></div>}
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
                            appView = <openedApp.app.MainView />;
                        } else if (openedApp.app.buildIn) {
                            const TheAppView = buildInView[openedApp.name];
                            appView = TheAppView && <TheAppView />;
                        }
                        if (!appView) {
                            appView = <div className="box">{Lang.string('exts.appNoView')}({openedApp.name})</div>;
                        }
                        return (<div
                            key={openedApp.name}
                            className={HTML.classes(`app-exts-app app-exts-app-${openedApp.name} dock scroll-y`, {hidden: !Exts.ui.isCurrentOpenedApp(openedApp.name)})}
                            style={{backgroundColor: openedApp.app.appBackColor}}
                        >{appView}</div>);
                    })
                }
            </div>
            {redirectView}
        </div>);
    }
}
