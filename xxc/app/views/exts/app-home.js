import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import AppAvatar from '../../components/app-avatar';
import SearchControl from '../../components/search-control';
import Button from '../../components/button';
import Exts from '../../exts';
import ROUTES from '../common/routes';
import App from '../../core';
import replaceViews from '../replace-views';

export default class AppHome extends PureComponent {
    static get AppHome() {
        return replaceViews('exts/app-home', AppHome);
    }

    static propTypes = {
        className: PropTypes.string,
    };

    static defaultProps = {
        className: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            search: '',
        };
    }

    componentDidMount() {
        this.onExtChangeHandler = Exts.all.onExtensionChange((changedExtensions) => {
            if (changedExtensions.some(x => x.isApp)) {
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        App.events.off(this.onExtChangeHandler);
    }

    handleSearchChange = search => {
        this.setState({search});
    };

    handleAppContextMenu = e => {
        const app = Exts.all.getExt(e.currentTarget.attributes['data-name'].value);
        App.ui.showContextMenu({x: e.clientX, y: e.clientY, target: e.target}, Exts.ui.createAppContextMenu(app));
        e.preventDefault();
    }

    render() {
        const {
            className,
        } = this.props;

        const {search} = this.state;
        const apps = (search ? Exts.all.searchApps(search) : Exts.all.apps).filter(x => (!x.isFixed && !x.hidden && !x.disabled));

        return (<div className={HTML.classes('app-ext-home dock column single', className)}>
            <header className="app-ext-home-header app-ext-common-header has-padding heading divider flex-none">
                <div className="title text-gray small">{Lang.format(search ? 'ext.home.findAppsCount.format' : 'ext.home.appsCount.format', apps.length)}</div>
                <div className="search-box">
                    <SearchControl onSearchChange={this.handleSearchChange} />
                </div>
                <nav className="toolbar">
                    <div className="nav-item hint--bottom-left has-padding-sm" data-hint={Lang.string('ext.home.manageInExtensionsApp')}>
                        <Button type="a" href={`#${ROUTES.exts.app.id('extensions/type=app')}`} className="iconbutton rounded" icon="settings-box text-gray icon-2x" />
                    </div>
                </nav>
            </header>
            <div className="app-exts-apps row has-padding flex-auto scroll-y content-start">
                {
                    apps.map(app => {
                        if (!app.avatarUIConfig) {
                            app.avatarUIConfig = {auto: app.appIcon, skin: app.appAccentColor, className: 'rounded shadow-1'};
                        }
                        return <AppAvatar onContextMenu={this.handleAppContextMenu} data-name={app.name} key={app.name} title={`【${app.displayName}】${app.description || ''}`} href={`#${ROUTES.exts.app.id(app.name)}`} avatar={app.avatarUIConfig} label={app.displayName} />;
                    })
                }
            </div>
        </div>);
    }
}
