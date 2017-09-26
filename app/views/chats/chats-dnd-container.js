import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Emojione from '../../components/emojione';
import Lang from '../../lang';
import App from '../../core';
import API from '../../network/api';
import StringHelper from '../../utils/string-helper';

class MenuHeader extends Component {

    handleDndEnter(e) {
        e.target.classList.add('hover');
    }

    handleDndLeave(e) {
        e.target.classList.remove('hover');
    }

    handleDndDrop(e) {
        e.target.classList.remove('hover');
        let file = e.dataTransfer.files[0];
        if(API.checkUploadFileSize(App.user, file.size)) {
            if(file.type.startsWith('image/')) {
                App.im.ui.sendContentToChat(file, 'image');
            } else {
                App.im.ui.sendContentToChat(file, 'file');
            }
        } else {
            App.ui.showMessger(Lang.error({code: 'UPLOAD_FILE_IS_TOO_LARGE', formats: StringHelper.formatBytes(App.user.uploadFileSize)}), {type: 'warning'});
        }
    }

    render() {
        let {
            className,
            style,
            children,
            ...other
        } = this.props;

        return <div className={HTML.classes('app-chats-dnd-container drag-n-drop-message center-content', className)} style={style} {...other} onDragEnter={this.handleDndEnter} onDrop={this.handleDndDrop} onDragLeave={this.handleDndLeave}>
            <div className="text-center">
                <div className="dnd-over" dangerouslySetInnerHTML={{__html: Emojione.toImage(':hatching_chick:')}}></div>
                <div className="dnd-hover" dangerouslySetInnerHTML={{__html: Emojione.toImage(':hatched_chick:')}}></div>
                <h1>{Lang.string('chats.drapNDropFileMessage')}</h1>
            </div>
            {children}
        </div>;
    }
}

export default MenuHeader;
