import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import StringHelper from '../../utils/string-helper';
import Lang from '../../lang';
import App from '../../core';
import API from '../../network/api';
import Emojione from '../../components/emojione';
import replaceViews from '../replace-views';

class ChatsDndContainer extends PureComponent {
    static get ChatsDndContainer() {
        return replaceViews('chats/chats-dnd-container', ChatsDndContainer);
    }

    static propTypes = {
        className: PropTypes.string,
    };

    static defaultProps = {
        className: null,
    };

    handleDndEnter = e => {
        e.target.classList.add('hover');
    }

    handleDndLeave = e => {
        e.target.classList.remove('hover');
    }

    handleDndDrop = e => {
        e.target.classList.remove('hover');
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
            let hasError = false;
            for (let i = 0; i < e.dataTransfer.files.length; ++i) {
                const file = e.dataTransfer.files[i];
                if (API.checkUploadFileSize(App.user, file.size)) {
                    if (file.type.startsWith('image/')) {
                        App.im.ui.sendContentToChat(file, 'image');
                    } else {
                        App.im.ui.sendContentToChat(file, 'file');
                    }
                } else {
                    hasError = true;
                }
            }
            if (hasError) {
                App.ui.showMessger(Lang.error({code: 'UPLOAD_FILE_IS_TOO_LARGE', formats: StringHelper.formatBytes(App.user.uploadFileSize)}), {type: 'warning'});
            }
        }
    }

    render() {
        const {
            className,
            ...other
        } = this.props;

        return (<div
            className={classes('app-chats-dnd-container drag-n-drop-message center-content', className)}
            {...other}
            onDragEnter={this.handleDndEnter}
            onDrop={this.handleDndDrop}
            onDragLeave={this.handleDndLeave}
        >
            <div className="text-center">
                <div className="dnd-over" dangerouslySetInnerHTML={{__html: Emojione.toImage(':hatching_chick:')}} />
                <div className="dnd-hover" dangerouslySetInnerHTML={{__html: Emojione.toImage(':hatched_chick:')}} />
                <h1>{Lang.string('chats.drapNDropFileMessage')}</h1>
            </div>
        </div>);
    }
}

export default ChatsDndContainer;
