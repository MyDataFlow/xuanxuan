import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Skin from '../../utils/skin';
import Avatar from '../../components/avatar';
import Button from '../../components/button';
import Lang from '../../lang';
import Exts from '../../exts';

export default class ExtensionDetail extends Component {
    static propTypes = {
        className: PropTypes.string,
        onRequestClose: PropTypes.func,
        extension: PropTypes.object.isRequired,
    };

    static defaultProps = {
        className: null,
        onRequestClose: null,
    };

    requestClose() {
        const {onRequestClose} = this.props;
        if (onRequestClose) {
            onRequestClose();
        }
    }

    handleUninstallBtnClick(extension) {
        Exts.ui.uninstallExtension(extension);
        this.requestClose();
    }

    handleOpenBtnClick(extension) {
        Exts.ui.openApp(extension.name);
        this.requestClose();
    }

    render() {
        const {
            extension,
            className,
            onRequestClose,
            ...other,
        } = this.props;

        const buttons = [];
        if (extension.isApp) {
            buttons.push(<Button onClick={this.handleOpenBtnClick.bind(this, extension)} key="open" icon="open-in-app" className="rounded green-pale outline hover-solid" label={Lang.string('ext.openApp')} />);
        }
        buttons.push(<Button onClick={this.handleUninstallBtnClick.bind(this, extension)} key="uninstall" icon="delete" className="rounded danger-pale outline hover-solid" label={Lang.string('ext.uninstall')} />);
        if (extension.homepage) {
            buttons.push(<Button key="homepage" type="a" href={extension.homepage} target="_blank" icon="home" className="rounded gray outline hover-solid" label={Lang.string('ext.homepage')} />);
        }
        if (extension.repository) {
            const repositoryUrl = extension.repository.url || extension.repository;
            const repositoryIcon = repositoryUrl.includes('github.com') ? 'github-circle' : 'source-fork';
            buttons.push(<Button key="repository" type="a" href={repositoryUrl} target="_blank" icon={repositoryIcon} className="rounded gray outline hover-solid" label={Lang.string('ext.repository')} />);
        }
        if (extension.bugs) {
            const bugsUrl = extension.bugs.url || extension.bugs;
            buttons.push(<Button key="bugs" type="a" href={bugsUrl} target="_blank" icon="bug" className="rounded gray outline hover-solid" label={Lang.string('ext.bugs')} />);
        }

        return (<div className={HTML.classes('app-ext-detail', className)} {...other}>
            <header style={Skin.style({code: extension.accentColor || '#333', textTint: false})}>
                <div className="app-ext-detail-header list-item with-avatar multi-lines">
                    <Avatar className="rounded shadow-1 flex-none" auto={extension.icon} skin={{code: extension.accentColor}} />
                    <div className="content">
                        <div className="title space-xs"><strong>{extension.displayName}</strong></div>
                        <div className="space-sm"><small className="muted rounded label darken-2">{extension.name}</small>  &nbsp; <small className="muted">{extension.version}</small></div>
                        {extension.description ? <div className="space-sm">{extension.description}</div> : null}
                        <div className="muted space">
                            <span className="app-ext-list-item-type-label label outline gray circle">{Lang.string(`ext.type.${extension.type}`)}</span>
                            <small> &nbsp; | &nbsp; {extension.author}</small>
                            {extension.license && <span> &nbsp; | &nbsp; <small>{`${Lang.string('ext.license')}: ${extension.license}`}</small></span>}
                        </div>
                        <div className="actions">
                            {buttons}
                        </div>
                    </div>
                </div>
            </header>
        </div>);
    }
}
