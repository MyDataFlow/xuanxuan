import React, {Component} from 'react';
import PropTypes from 'prop-types';
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

    shouldComponentUpdate(nextProps) {
        return nextProps.className !== this.props.className || nextProps.message !== this.props.message || nextProps.message.updateId !== this.lastMessageUpdateId;
    }

    render() {
        const {
            message,
            className,
            ...other
        } = this.props;

        const content = message.fileContent;
        this.lastMessageUpdateId = message.updateId;

        return <FileListItem className={HTML.classes('app-message-content-file layer rounded flex-inline shadow-2 list-item', className)} file={content} {...other} />;
    }
}

export default MessageContentFile;
