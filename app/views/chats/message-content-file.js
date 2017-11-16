import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import {FileListItem} from '../common/file-list-item';
import replaceViews from '../replace-views';

class MessageContentFile extends Component {
    static propTypes = {
        className: PropTypes.string,
        message: PropTypes.object.isRequired,
    };

    static defaultProps = {
        className: null,
    };

    static get MessageContentFile() {
        return replaceViews('chats/chat-content-file', MessageContentFile);
    }

    render() {
        const {
            message,
            className,
            ...other
        } = this.props;

        const content = message.fileContent;

        return <FileListItem className={HTML.classes('app-message-content-file layer rounded flex-inline shadow-2 list-item', className)} file={content} {...other} />;
    }
}

export default MessageContentFile;
