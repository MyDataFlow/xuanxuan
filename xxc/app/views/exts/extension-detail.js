import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Skin from '../../utils/skin';
import Avatar from '../../components/avatar';
import Button from '../../components/button';
import Icon from '../../components/icon';
import Spinner from '../../components/spinner';
import Lang from '../../lang';
import Exts from '../../exts';
import Markdown from '../../utils/markdown';
import Emojione from '../../components/emojione';
import replaceViews from '../replace-views';
import App from '../../core';

export default class ExtensionDetail extends Component {
    static get ExtensionDetail() {
        return replaceViews('exts/extension-detail', ExtensionDetail);
    }

    static propTypes = {
        className: PropTypes.string,
        onRequestClose: PropTypes.func,
        extension: PropTypes.object.isRequired,
    };

    static defaultProps = {
        className: null,
        onRequestClose: null,
    };

    constructor(props) {
        super(props);
        this.state = {loadingReadme: true};
    }

    componentDidMount() {
        const {extension} = this.props;
        Exts.manager.loadReadmeMarkdown(extension).then(readme => {
            readme = Markdown(readme);
            readme = Emojione.toImage(readme);
            this.readmeContent = readme;
            this.setState({loadingReadme: false});
        }).catch(() => {
            this.setState({loadingReadme: false});
        });

        this.onExtChangeHandler = Exts.all.onExtensionChange(changedExtensions => {
            if (changedExtensions.some(x=> x.name === this.props.extension.name)) {
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        App.events.off(this.onExtChangeHandler);
    }

    requestClose() {
        const {onRequestClose} = this.props;
        if (onRequestClose) {
            onRequestClose();
        }
    }

    handleUninstallBtnClick(extension) {
        Exts.ui.uninstallExtension(extension, this.requestClose.bind(this));
    }

    handleOpenBtnClick(extension) {
        Exts.ui.openApp(extension.name);
        this.requestClose();
    }

    handleEnableBtnClick(extension) {
        Exts.manager.setExtensionDisabled(extension, false);
    }

    handleDisableBtnClick(extension) {
        Exts.manager.setExtensionDisabled(extension, true);
    }

    render() {
        const {
            extension,
            className,
            onRequestClose,
            ...other,
        } = this.props;

        const buttons = [];
        if (extension.isApp && extension.avaliable) {
            buttons.push(<Button onClick={this.handleOpenBtnClick.bind(this, extension)} key="open" icon="open-in-app" className="rounded green-pale outline hover-solid" label={Lang.string('ext.openApp')} />);
        }
        if (!extension.buildIn && !extension.isRemote) {
            if (extension.disabled) {
                buttons.push(<Button onClick={this.handleEnableBtnClick.bind(this, extension)} key="enable" icon="play-protected-content" className="rounded green-pale outline hover-solid" label={Lang.string('ext.enable')} />);
            } else {
                buttons.push(<Button onClick={this.handleDisableBtnClick.bind(this, extension)} key="disable" icon="cancel" className="rounded danger-pale outline hover-solid" label={Lang.string('ext.disable')} />);
            }
        }
        if (!extension.buildIn && !extension.isRemote) {
            buttons.push(<Button onClick={this.handleUninstallBtnClick.bind(this, extension)} key="uninstall" icon="delete" className="rounded danger-pale outline hover-solid" label={Lang.string('ext.uninstall')} />);
        }
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

        let loadingView = null;
        let sectionView = null;
        if (this.state.loadingReadme) {
            loadingView = <Spinner className="dock dock-bottom" iconClassName="text-white spin inline-block" />;
        } else if (this.readmeContent) {
            sectionView = <section className="has-padding-lg" style={Skin.style({code: extension.accentColor || '#333', textTint: false, pale: true})}><div className="markdown-content" dangerouslySetInnerHTML={{__html: this.readmeContent}} /></section>;
        }

        const titleViews = [<span className="text" key="ext-name">{extension.displayName}</span>];
        if (extension.buildIn) {
            titleViews.push(<span key="ext-buildIn-label" data-hint={Lang.string('ext.buildIn.hint')} className="hint--top hint--md"><Icon name="star-circle text-yellow" /></span>);
        }
        if (extension.isRemote) {
            titleViews.push(<span key="ext-remote-label" data-hint={Lang.string('ext.remote.hint')} className="hint--top hint--md app-ext-list-item-remote-label"> <Icon name="verified text-green" /></span>);
        }
        if (extension.needRestart) {
            titleViews.push(<span key="ext-needRestart" className="circle label warning">{Lang.string('ext.extension.needRestart')}</span>);
        }
        titleViews.push(<span key="ext-type" className="muted circle label darken-3 code">#{Lang.string(`ext.type.${extension.type}`)} ∗ {extension.name}</span>);

        const attrViews = [];
        if (extension.version) {
            attrViews.push(<span key="ext-version">v{extension.version}</span>);
        }
        if (extension.author || extension.publisher) {
            let authorView = null;
            if (extension.author && extension.publisher) {
                authorView = `${Lang.string('ext.author')}: ${extension.authorName} · ${Lang.format('ext.publisher.format', extension.publisher)}`;
            } else if (extension.author) {
                authorView = `${Lang.string('ext.author')}: ${extension.authorName}`;
            } else {
                authorView = Lang.format('ext.publisher.format', extension.publisher);
            }
            attrViews.push(<span key="ext-author">{authorView}</span>);
        }
        if (extension.license) {
            attrViews.push(<span key="ext-license">{`${Lang.string('ext.license')}: ${extension.license}`}</span>);
        }

        return (<div className={HTML.classes('app-ext-detail', className)} {...other}>
            <header style={Skin.style({code: extension.accentColor || '#333', textTint: false})}>
                <div className="app-ext-detail-header list-item with-avatar multi-lines relative">
                    <Avatar className="rounded shadow-1 flex-none" auto={extension.icon} skin={{code: extension.accentColor}} />
                    <div className="content">
                        <div className="title space-sm">{titleViews}</div>
                        <div className="space-sm attrs">{attrViews}</div>
                        {extension.description ? <div className="space-sm">{extension.description}</div> : null}
                        <div className="actions">{buttons}</div>
                    </div>
                    {loadingView}
                </div>
            </header>
            {sectionView}
        </div>);
    }
}
