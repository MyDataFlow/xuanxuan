import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Messager from '../../components/messager';
import Lang from '../../lang';
import App from '../../core';
import API from '../../network/api';
import MDIFileIcon from '../../utils/mdi-file-icon';
import StringHelper from '../../utils/string-helper';
import Platform from 'Platform';

class FileListItem extends Component {

    static defaultProps = {
        className: 'flex-middle'
    };

    constructor(props) {
        super(props);
        this.state = {
            download: false
        };
    }

    handleDownloadBtnClick(file) {
        Platform.dialog.downloadAndSaveFile(file, progress => {
            this.setState({download: Math.floor(progress)});
        }).then(result => {
            if(result.filename) {
                const filename = result.filename;
                Messager.show(Lang.format('file.fileSavedAt.format', filename), {
                    action: [{
                        label: Lang.string('file.open'),
                        click: () => {
                            Platform.ui.openItem(filename);
                        }
                    }, {
                        label: Lang.string('file.openFolder'),
                        click: () => {
                            Platform.ui.openFileItem(filename);
                        }
                    }]
                });
            }
        }).catch(error => {
            if(error) {
                Messager.show(Lang.error(error), {type: 'danger'});
            }
        });
    }

    render() {
        let {
            file,
            className,
            children,
            ...other
        } = this.props;

        const fileName = file.name;
        const ext = fileName.substr(fileName.lastIndexOf('.'));
        let fileStatus = null, actions = null;
        if(file.send === false) {
            fileStatus = <span className="text-danger small">{Lang.string('file.uploadFailed')} </span>;
        } else if(typeof file.send === 'number') {
            const percent = Math.floor(file.send);
            actions = <Avatar className="avatar secondary outline small circle" label={percent + '%'}/>
        } else if(file.send === true) {
            const fileUrl = API.createFileDownloadUrl(App.profile.user, file);
            file.url = fileUrl;
            if(Platform.type === 'browser') {
                actions = <div className="hint--top" data-hint={Lang.string('file.download')}><a href={fileUrl} download={fileName} target="_blank" className="btn iconbutton text-primary rounded"><Icon name="download"/></a></div>;
            } else {
                if(this.state.download) {
                    actions = <Avatar className="avatar secondary outline small circle" label={this.state.download + '%'}/>
                } else {
                    actions = <div className="hint--top" data-hint={Lang.string('file.download')}><button onClick={this.handleDownloadBtnClick.bind(this, file)} type="button" className="btn iconbutton text-primary rounded"><Icon name="download"/></button></div>;
                }
            }
        }

        return <div {...other}
            className={HTML.classes('app-file-list-item item row flex-middle', className)}
        >
            <Avatar lightSkin={true} skin={ext} className="circle" icon={MDIFileIcon.getIcon(ext)}/>
            <div className="content">
                <div className="title">{fileName}</div>
                <div>{fileStatus}<span className="muted small">{StringHelper.formatBytes(file.size)}</span></div>
            </div>
            {actions}
        </div>;
    }
}

export default FileListItem;
