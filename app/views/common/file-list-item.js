import React, {Component, PropTypes} from 'react';
import Platform from 'Platform';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Messager from '../../components/messager';
import Lang from '../../lang';
import App from '../../core';
import API from '../../network/api';
import MDIFileIcon from '../../utils/mdi-file-icon';
import StringHelper from '../../utils/string-helper';
import UserAvatar from './user-avatar';

class FileListItem extends Component {
    static propTypes = {
        file: PropTypes.object.isRequired,
        smallIcon: PropTypes.bool,
        showSender: PropTypes.bool,
        className: PropTypes.string,
    };

    static defaultProps = {
        className: 'flex-middle',
        smallIcon: false,
        showSender: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            download: false
        };
    }

    handleDownloadBtnClick(file) {
        if (Platform.dialog.showSaveDialog) {
            Platform.dialog.showSaveDialog({filename: file.name}, filename => {
                if (filename) {
                    file.path = filename;
                    this.setState({download: 0});
                    API.downloadFile(App.user, file, progress => {
                        this.setState({download: progress});
                    }).then(theFile => {
                        this.setState({download: false});
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
            ...other
        } = this.props;

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
            file.url = API.createFileDownloadUrl(App.profile.user, file);
            if (Platform.type === 'browser') {
                actions = <div className="hint--top" data-hint={Lang.string('file.download')}><a href={file.url} download={fileName} target="_blank" className="btn iconbutton text-primary rounded"><Icon name="download" /></a></div>;
            } else {
                if (this.state.download !== false) {
                    fileStatus = <span className="text-primary small">{Lang.string('file.downloading')} </span>;
                    actions = <Avatar className="avatar secondary outline small circle" label={Math.floor(this.state.download) + '%'} />;
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
            {smallIcon ? null : <Avatar skin={{code: ext, pale: true}} className="circle flex-none" icon={MDIFileIcon.getIcon(ext)} />}
            <div className="content">
                <div className="title">{fileName}</div>
                <div className="sub-content">
                    {fileStatus}
                    {sender ? <span><UserAvatar size={16} user={sender} /> <small className="muted">{sender.displayName}</small></span> : null}
                    <span className="muted small">{StringHelper.formatBytes(file.size)}</span>
                </div>
            </div>
            {actions && <div className="actions">{actions}</div>}
        </div>);
    }
}

export default FileListItem;
