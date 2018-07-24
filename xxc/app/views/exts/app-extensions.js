import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import SearchControl from '../../components/search-control';
import Icon from '../../components/icon';
import Button from '../../components/button';
import Exts from '../../exts';
import OpenedApp from '../../exts/opened-app';
import App from '../../core';
import {ExtensionListItem} from './extension-list-item';
import replaceViews from '../replace-views';

const extensionTypes = [
    {type: '', label: Lang.string('ext.extensions.all')},
    {type: 'app', label: Lang.string('ext.extensions.apps')},
    {type: 'plugin', label: Lang.string('ext.extensions.plugins')},
    {type: 'theme', label: Lang.string('ext.extensions.themes')},
];

export default class AppExtensions extends Component {
    static get AppExtensions() {
        return replaceViews('exts/app-extensions', AppExtensions);
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
        this.onExtChangeHandler = Exts.all.onExtensionChange(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        App.events.off(this.onExtChangeHandler);
    }

    handleNavItemClick(extType) {
        this.props.app.params = {type: extType.type};
        this.setState({type: extType.type});
    }

    handleSearchChange = search => {
        this.setState({search});
    };

    handleSettingBtnClick(ext, e) {
        const menuItems = Exts.ui.createSettingContextMenu(ext);
        App.ui.showContextMenu({x: e.clientX, y: e.clientY, target: e.target}, menuItems);
        e.preventDefault();
        e.stopPropagation();
    }

    handleExtensionItemClick(ext, e) {
        Exts.ui.showExtensionDetailDialog(ext);
        if (DEBUG) {
            console.collapse('Extension View', 'greenBg', ext.displayName, 'greenPale');
            console.log('extension', ext);
            console.groupEnd();
        }
    }

    handleInstallBtnClick = () => {
        Exts.ui.installExtension();
    };

    handleMenuBtnClick = e => {
        const menu = [{
            label: Lang.string('ext.extensions.installDevExtension'),
            click: () => {
                Exts.ui.installExtension(true);
            }
        }];
        App.ui.showContextMenu({x: e.clientX, y: e.clientY, target: e.target}, menu);
    };

    handleRestartBtnClick = () => {
        App.ui.reloadWindow();
    };

    render() {
        const {
            className,
            app,
        } = this.props;

        const {search, type} = this.state;
        const extensions = search ? Exts.all.search(search, type) : Exts.all.getTypeList(type);
        const needRestartExts = extensions && extensions.filter(x => x.needRestart);

        return (<div className={HTML.classes('app-ext-extensions dock column single', className)}>
            <header className="app-ext-extensions-header app-ext-common-header has-padding heading divider flex-none">
                <nav className="nav">
                    {
                        extensionTypes.map(extType => {
                            return <a key={extType.type} onClick={this.handleNavItemClick.bind(this, extType)} className={extType.type === type ? 'active' : ''}>{extType.label}</a>;
                        })
                    }
                </nav>
                <div className="search-box">
                    <SearchControl onSearchChange={this.handleSearchChange} />
                </div>
                <nav className="toolbar">
                    <div className="nav-item has-padding-sm hint--left" data-hint={Lang.string('ext.extensions.installLocalExtTip')}>
                        <Button onClick={this.handleInstallBtnClick} className="rounded outline green hover-solid" icon="package-variant" label={Lang.string('ext.extensions.installLocalExtension')} />
                    </div>
                    <div className="nav-item has-padding-sm hint--left" data-hint={Lang.string('ext.extensions.moreActions')}>
                        <Button onClick={this.handleMenuBtnClick} className="rounded outline primary hover-solid" icon="menu" />
                    </div>
                </nav>
            </header>
            {
                needRestartExts && needRestartExts.length ? <div className="warning-pale text-warning flex-none center-content"><div className="heading">
                    <Icon name="information" />
                    <div className="title">{Lang.format('ext.extensions.needRestartTip.format', needRestartExts.length)}</div>
                    <Button onClick={this.handleRestartBtnClick} className="outline warning hover-solid rounded" label={Lang.string('ext.extensions.restart')} icon="restart" />
                </div></div> : null
            }
            <div className="app-exts-list list has-padding multi-lines with-avatar flex-auto scroll-y content-start">
                <div className="heading">
                    <div className="title">{Lang.string(search ? 'ext.extensions.searchResult' : 'ext.extensions.installed')}{type ? ` - ${Lang.string('ext.type.' + type)}` : ''} ({extensions.length})</div>
                </div>
                {
                    extensions.map(ext => {
                        const onContextMenu = this.handleSettingBtnClick.bind(this, ext);
                        return (<ExtensionListItem
                            showType={!type}
                            key={ext.name}
                            onContextMenu={onContextMenu}
                            onSettingBtnClick={onContextMenu}
                            onClick={this.handleExtensionItemClick.bind(this, ext)}
                            className="item flex-middle"
                            extension={ext}
                        />);
                    })
                }
            </div>
        </div>);
    }
}
