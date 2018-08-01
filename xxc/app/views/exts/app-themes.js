import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import SearchControl from '../../components/search-control';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import OpenedApp from '../../exts/opened-app';
import Exts from '../../exts';
import App from '../../core';
import replaceViews from '../replace-views';
import Skin from '../../utils/skin';

export default class AppThemes extends PureComponent {
    static get AppThemes() {
        return replaceViews('exts/app-themes', AppThemes);
    }

    static propTypes = {
        className: PropTypes.string,
        app: PropTypes.instanceOf(OpenedApp).isRequired,
    };

    static defaultProps = {
        className: null,
    };

    constructor(props) {
        super(props);
        const {app} = props;
        this.state = {
            search: '',
            showInstalled: true,
            type: (app.params && app.params.type) ? app.params.type : ''
        };
    }

    componentDidMount() {
        this.onExtChangeHandler = Exts.all.onExtensionChange((changedExtensions) => {
            if (changedExtensions.some(x => x.isTheme)) {
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

    handleThemeClick = theme => {
        const error = Exts.themes.setCurrentTheme(theme);
        if (error) {
            App.ui.showMessger(Lang.error(error), {type: 'danger'});
        }
        this.forceUpdate();
    }

    render() {
        const {
            className,
            app,
        } = this.props;

        const {search} = this.state;
        const themeExts = (search ? Exts.themes.search(search) : Exts.themes.all).filter(x => !x.disabled);
        const showDefaultTheme = !search || 'default'.includes(search) || Lang.string('ext.themes.default').includes(search);

        let themesCount = 1;
        const themeViews = themeExts.map(themeExt => {
            return (<div key={themeExt.name} className="app-themes-list list multi-lines with-avatar">
                <div className="heading">
                    <Avatar style={{color: themeExt.accentColor}} auto={themeExt.icon} className="rounded no-margin avatar-sm" />
                    <div className="title"><span>{themeExt.displayName}</span> <small className="text-gray">{themeExt.author ? `@${themeExt.authorName}` : ''}</small></div>
                </div>
                {
                    themeExt.themes.map(theme => {
                        themesCount += 1;
                        const isCurrentTheme = Exts.themes.isCurrentTheme(theme.id);
                        const preview = theme.preview;
                        const themeStyle = Object.assign(Skin.style(theme.color), {
                            backgroundImage: preview ? `url(${preview})` : null
                        });
                        return (<a key={theme.id} className={HTML.classes('item rounded shadow-1', {active: isCurrentTheme})} style={themeStyle} onClick={this.handleThemeClick.bind(this, theme)}>
                            <div className="content">
                                <div className="title">{theme.displayName}{isCurrentTheme && <small className="label circle white text-black shadow-1">{Lang.string('ext.themes.current')}</small>}</div>
                            </div>
                            <Icon name="check active-icon icon-2x text-shadow-white" />
                        </a>);
                    })
                }
            </div>);
        });

        const isCurrentDefault = Exts.themes.isCurrentTheme('default');

        return (<div className={HTML.classes('app-ext-themes dock column single', className)}>
            <header className="app-ext-themes-header app-ext-common-header has-padding heading flex-none divider">
                <div className="title text-gray small">{Lang.format('ext.themes.count.format', themesCount)}</div>
                <div className="search-box">
                    <SearchControl onSearchChange={this.handleSearchChange} />
                </div>
                <nav className="toolbar" />
            </header>
            <div className="app-themes flex-auto scroll-y content-start has-padding">
                {themeViews}
                {showDefaultTheme && <div className="app-themes-list list">
                    <div className="heading">
                        <Avatar style={{color: app.app.accentColor}} auto={app.app.icon} className="rounded no-margin avatar-sm" />
                        <div className="title">{Lang.string('ext.themes.inside')}</div>
                    </div>
                    <a className={HTML.classes('item rounded shadow-1', {active: isCurrentDefault})} style={Skin.style('#3f51b5')} onClick={this.handleThemeClick.bind(this, 'default')}>
                        <div className="content">
                            <div className="title">{Lang.string('ext.themes.default')} {isCurrentDefault && <small className="label circle white text-black shadow-1">{Lang.string('ext.themes.current')}</small>}</div>
                        </div>
                        <Icon name="check active-icon icon-2x text-shadow-white" />
                    </a>
                </div>}
            </div>
        </div>);
    }
}
