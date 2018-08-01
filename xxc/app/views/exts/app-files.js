import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import SearchControl from '../../components/search-control';
import OpenedApp from '../../exts/opened-app';
import App from '../../core';
import Spinner from '../../components/spinner';
import {FileList} from '../common/file-list';
import replaceViews from '../replace-views';

const fileTypes = [
    {type: '', label: Lang.string('ext.files.all')},
    {type: 'doc', label: Lang.string('ext.files.docs')},
    {type: 'image', label: Lang.string('ext.files.images')},
    {type: 'program', label: Lang.string('ext.files.programs')},
    {type: 'other', label: Lang.string('ext.files.others')},
];

const MAX_SHOW_FILES_COUNT = 200;

export default class AppFiles extends PureComponent {
    static get AppFiles() {
        return replaceViews('exts/app-files', AppFiles);
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
            files: [],
            loading: false,
            type: (app.params && app.params.type) ? app.params.type : ''
        };
    }

    componentDidMount() {
        this.loadFiles();
        this.onUserLoginHandler = App.server.onUserLogin(() => {
            this.loadFiles();
        });
    }

    componentWillUnmount() {
        App.events.off(this.onUserLoginHandler);
    }

    handleNavItemClick(fileType) {
        this.props.app.params = {type: fileType.type};
        this.loadFiles(null, fileType.type);
    }

    handleSearchChange = search => {
        this.loadFiles(search);
    };

    loadFiles(search = null, type = null) {
        if (this.state.loading) {
            // App.ui.showMessger(Lang.string('common.waiting'));
            return;
        }
        const state = {search: this.state.search, type: this.state.type};
        if (search !== null) {
            state.search = search;
        }
        if (type !== null) {
            state.type = type;
        }
        const searchId = `${this.state.search} :${this.state.type}`;
        if (!App.profile.isUserVertified) {
            return this.setState({files: [], loading: false});
        }
        if (this.searchId !== searchId) {
            state.loading = true;
            state.files = [];
            this.setState(state, () => {
                App.im.files.search(state.search, state.type).then(files => {
                    this.setState({files, loading: false});
                }).catch(error => {
                    if (error) {
                        App.ui.showMessger(Lang.string(error), {type: 'danger'});
                        if (DEBUG) {
                            console.error('load files error', error);
                        }
                    }
                    this.setState({files: [], loading: false});
                });
            });
        } else {
            this.setState(state);
        }
    }

    render() {
        const {
            className,
            app,
        } = this.props;

        const {loading, type} = this.state;
        const filesCount = this.state.files ? this.state.files.length : 0;
        let showFiles = filesCount ? this.state.files : [];
        if (showFiles.length > MAX_SHOW_FILES_COUNT) {
            showFiles = showFiles.slice(0, MAX_SHOW_FILES_COUNT);
        }

        return (<div className={HTML.classes('app-ext-files dock single column', className)}>
            <header className="app-ext-files-header app-ext-common-header has-padding heading divider flex-none">
                <nav className="nav">
                    {
                        fileTypes.map(fileType => {
                            return <a key={fileType.type} onClick={this.handleNavItemClick.bind(this, fileType)} className={fileType.type === type ? 'active' : ''}>{fileType.label}</a>;
                        })
                    }
                </nav>
                <div className="search-box flex-none">
                    <SearchControl onSearchChange={this.handleSearchChange} changeDelay={1000} />
                </div>
            </header>
            <div className="flex-auto content-start scroll-y">
                {filesCount ? <div className="heading gray">
                    <div className="title strong muted small">{Lang.format('ext.files.findCount.format', filesCount)}</div>
                </div> : null}
                <FileList listItemProps={{showDate: true, showSender: true}} files={showFiles} className="app-ext-files-list multi-lines with-avatar" />
                {showFiles.length < filesCount && <div className="heading divider-top"><small className="title muted">{Lang.format('ext.files.findToMany.format', filesCount, showFiles.length, filesCount - showFiles.length)}</small></div>}
                {loading && <Spinner className="has-padding-lg" label={Lang.string('common.loading')} />}
            </div>
        </div>);
    }
}
