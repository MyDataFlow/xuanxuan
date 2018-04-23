import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Avatar from '../../components/avatar';
import Button from '../../components/button';
import Icon from '../../components/icon';
import Lang from '../../lang';
import Exts from '../../exts';
import App from '../../core';
import DateHelper from '../../utils/date-helper';
import replaceViews from '../replace-views';

export default class ExtensionListItem extends Component {
    static get ExtensionListItem() {
        return replaceViews('exts/extension-list-item', ExtensionListItem);
    }

    static propTypes = {
        className: PropTypes.string,
        extension: PropTypes.object.isRequired,
        onSettingBtnClick: PropTypes.func,
        showType: PropTypes.bool,
    };

    static defaultProps = {
        className: null,
        onSettingBtnClick: null,
        showType: true,
    };

    handleReloadBtnClick = e => {
        e.preventDefault();
        e.stopPropagation();
        Exts.manager.reloadDevExtension(this.props.extension);
        App.ui.showMessger(Lang.string('ext.extensions.reloadFinish'), {type: 'success'});
    };

    handleShowFolderBtnClick = e => {
        e.preventDefault();
        e.stopPropagation();
        return Exts.ui.showDevFolder(this.props.extension);
    };

    render() {
        const {
            extension,
            className,
            onSettingBtnClick,
            showType,
            ...other,
        } = this.props;

        const isDev = extension.isDev;
        const disabled = extension.disabled;

        let typeLabelView = null;
        if (showType) {
            typeLabelView = <span className="app-ext-list-item-type-label" style={{color: Exts.ui.typeColors[extension.type]}}>#{Lang.string(`ext.type.${extension.type}`)}</span>;
        }

        let actionsView = null;
        if (isDev) {
            actionsView = (<div className="toolbar row flex-none">
                <div className="hint--top" data-hint={Lang.string('ext.extensions.reload')}><Button onClick={this.handleReloadBtnClick} icon="reload" className="iconbutton rounded" /></div>
                <div className="hint--top" data-hint={Lang.string('ext.extensions.showFolder')}><Button onClick={this.handleShowFolderBtnClick} icon="folder-outline" className="iconbutton rounded" /></div>
                <div className="hint--top" data-hint={Lang.string('ext.extensions.moreActions')}><Button onClick={onSettingBtnClick} icon="dots-vertical" className="iconbutton rounded" /></div>

            </div>);
        } else {
            actionsView = <Button onClick={onSettingBtnClick} icon="dots-vertical" className="iconbutton rounded" />;
        }

        return (<a className={HTML.classes('app-ext-list-item', className, {'app-ext-list-item-dev': isDev})} {...other}>
            <Avatar className={HTML.classes('rounded shadow-1 flex-none', {'align-self-start': isDev, grayscale: disabled})} auto={extension.icon} skin={{code: extension.accentColor}} />
            <div className="content">
                <div className="title"><strong>{extension.displayName}</strong>{extension.buildIn ? <span data-hint={Lang.string('ext.buildIn')} className="hint--top app-ext-list-item-buildIn-label"> <Icon name="star-circle icon-sm text-yellow" /></span> : null} &nbsp;<small className="text-gray">{extension.version ? `v${extension.version}` : ''}</small></div>
                <div className={'small space-xs' + (isDev ? '' : ' text-ellipsis')}>{extension.description}</div>
                <div className="small row flex-middle">{disabled ? <span><span className="label circle dark">{Lang.string('ext.disabled')}</span>&nbsp; </span> : null}{extension.needRestart && <span className="hint--top relative" style={{zIndex: 10}} data-hint={Lang.string('ext.extension.needRestartTip')}><small className="label circle warning">{Lang.string('ext.extension.needRestart')}</small> &nbsp;</span>}{isDev ? <span><small className="label primary circle">{Lang.string('ext.extensions.developing')}</small> &nbsp;</span> : null}{typeLabelView}<span className="text-gray">{extension.author ? `@${extension.authorName}` : ''}</span></div>
                {isDev && <div className="has-padding small infos">
                    <ul className="no-margin">
                        <li><strong>{Lang.string('ext.extension.loadPath')}</strong>: <span className="code">{extension.localPath}</span></li>
                        <li><strong>{Lang.string('ext.extension.installTime')}</strong>: <span className="code">{DateHelper.formatDate(extension.installTime, 'yyyy-MM-dd hh:mm:ss')}</span> &nbsp; <strong>{Lang.string('ext.extension.updateTime')}</strong>: <span className="code">{DateHelper.formatDate(extension.updateTime, 'yyyy-MM-dd hh:mm:ss')}</span></li>
                        {extension.loadTime ? <li><strong>{Lang.string('ext.extension.loadTime')}</strong>: <span className={'code' + (extension.loadTime > 50 ? ' text-red' : '')}>{extension.loadTime}ms</span></li> : null}
                    </ul>
                </div>}
                {(isDev && extension.hasError) && <div className="has-padding small errors">
                    <div>{Lang.string('ext.extension.pkgHasError')}</div>
                    <ul className="no-margin">
                        {
                            extension.errors.map(error => {
                                return <li key={error.name}><strong className="code">{error.name}</strong>: {error.error}</li>;
                            })
                        }
                    </ul>
                </div>}
            </div>
            {actionsView}
        </a>);
    }
}
