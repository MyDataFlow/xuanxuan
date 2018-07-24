import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Platform from 'Platform';
import HTML from '../../utils/html-helper';
import MDIFileIcon from '../../utils/mdi-file-icon';
import StringHelper from '../../utils/string-helper';
import DateHelper from '../../utils/date-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Messager from '../../components/messager';
import Lang from '../../lang';
import App from '../../core';
import {UserAvatar} from './user-avatar';
import replaceViews from '../replace-views';
import FileData from '../../core/models/file-data';

const isBrowserPlatform = Platform.type === 'browser';

class FileListItem extends Component {
    static get FileListItem() {
        return replaceViews('common/file-list-item', FileListItem);
    }

    static propTypes = {
        file: PropTypes.object.isRequired,
        smallIcon: PropTypes.bool,
        showSender: PropTypes.bool,
        className: PropTypes.string,
        showDate: PropTypes.bool,
    };

    static defaultProps = {
        className: 'flex-middle',
        smallIcon: false,
        showSender: false,
        showDate: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            download: false,
            localPath: '',
        };
    }

    componentDidMount() {
        this.checkLocalPath();
    }

    shouldComponentUpdate(nextProps, nextStates) {
        return nextStates.download !== this.state.download || nextStates.localPath !== this.state.localPath || nextProps.className !== this.props.className || nextProps.smallIcon !== this.props.smallIcon || nextProps.showSender !== this.props.showSender || nextProps.showDate !== this.props.showDate || nextProps.file !== this.props.file || nextProps.file.send !== this.props.file.send || nextProps.file.id !== this.props.file.id || nextProps.file.name !== this.props.file.name;
    }

    componentDidUpdate() {
        this.checkLocalPath();
    }

    checkLocalPath() {
        const {localPath} = this.state;
        const file = FileData.create(this.props.file);
        if (!isBrowserPlatform && file.send === true && localPath !== false && !localPath) {
            App.im.files.checkCache(file).then(existsPath => {
                this.setState({localPath: existsPath});
            }).catch(error => {
                if (DEBUG) {
                    console.error('API.checkCache error', error);
                }
                this.setState({localPath: false});
            });
        }
    }

    handleDownloadBtnClick(file) {
        if (Platform.dialog.showSaveDialog) {
            Platform.dialog.showSaveDialog({filename: file.name}, filename => {
                if (filename) {
                    file.path = filename;
                    this.setState({download: 0});
                    App.im.files.downloadFile(file, progress => {
                        this.setState({download: progress});
                    }).then(theFile => {
                        this.setState({download: false, localPath: filename});
                        return Messager.show(Lang.format('file.fileSavedAt.format', filename), {
                            actions: [{
                                label: Lang.string('file.open'),
                                click: () => {
                                    Platform.ui.openFileItem(filename);
                                }
                            }, {
                                label: Lang.string('file.openFolder'),
                                click: () => {
                                    Platform.ui.showItemInFolder(filename);
                                }
                            }]
                        });
                    }).catch(error => {
                        this.setState({download: false});
                        if (error) {
                            Messager.show(Lang.error(error), {type: 'danger'});
                        }
                    });
                }
            });
        }
    }

    render() {
        let {
            file,
            className,
            smallIcon,
            showSender,
            showDate,
            ...other
        } = this.props;

        file = FileData.create(file);

        const fileName = file.name;
        const ext = fileName.substr(fileName.lastIndexOf('.'));
        let fileStatus = null;
        let actions = null;
        if (file.send === false) {
            fileStatus = <span className="text-danger small">{Lang.string('file.uploadFailed')} </span>;
        } else if (typeof file.send === 'number') {
            const percent = Math.floor(file.send);
            actions = <Avatar className="avatar secondary outline small circle" label={`${percent}%`} />;
        } else if (file.send === true) {
            file.makeUrl(App.profile.user);
            if (isBrowserPlatform) {
                actions = <div className="hint--top" data-hint={Lang.string('file.download')}><a href={file.url} download={fileName} target="_blank" className="btn iconbutton text-primary rounded"><Icon name="download" /></a></div>;
            } else {
                if (this.state.download !== false) {
                    fileStatus = <span className="text-primary small">{Lang.string('file.downloading')} </span>;
                    actions = <Avatar className="avatar secondary outline small circle" label={Math.floor(this.state.download) + '%'} />;
                } else if(this.state.localPath) {
                    actions = [
                        <div key="action-open" className="hint--top" data-hint={Lang.string('file.open')}><button onClick={Platform.ui.openFileItem.bind(this, this.state.localPath)} type="button" className="btn iconbutton text-primary rounded"><Icon name="open-in-app" /></button></div>,
                        <div key="action-open-folder" className="hint--top-left" data-hint={Lang.string('file.openFolder')}><button onClick={Platform.ui.showItemInFolder.bind(this, this.state.localPath)} type="button" className="btn iconbutton text-primary rounded"><Icon name="folder-outline" /></button></div>,
                        <div key="action-download" className="hint--top" data-hint={Lang.string('file.download')}><button onClick={this.handleDownloadBtnClick.bind(this, file)} type="button" className="btn iconbutton text-primary rounded"><Icon name="download" /></button></div>
                    ];
                } else {
                    actions = <div className="hint--top" data-hint={Lang.string('file.download')}><button onClick={this.handleDownloadBtnClick.bind(this, file)} type="button" className="btn iconbutton text-primary rounded"><Icon name="download" /></button></div>;
                }
            }
        }

        const sender = showSender && file.senderId && App.members.get(file.senderId);

        return (<div
            {...other}
            className={HTML.classes('app-file-list-item item row flex-middle single', className)}
        >
            {smallIcon ? null : <Avatar skin={{code: ext, pale: true}} className="flex-none" icon={MDIFileIcon.getIcon(ext)} />}
            <div className="content">
                <div className="title">{fileName}</div>
                <div className="sub-content">
                    {fileStatus}
                    {sender ? <span><UserAvatar size={16} user={sender} /> <small className="muted">{sender.displayName}</small></span> : null}
                    <span className="muted small">{StringHelper.formatBytes(file.size)}</span>
                    {showDate && <span className="small muted">{DateHelper.formatDate(file.date)}</span>}
                </div>
            </div>
            {actions && <div className="actions">{actions}</div>}
        </div>);
    }
}

export default FileListItem;
