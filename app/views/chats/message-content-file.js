import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import App from '../../core';
import FileListItem from '../common/file-list-item';

class MessageContentFileView extends Component {

    render() {
        let {
            message,
            className,
            ...other
        } = this.props;

        const content = message.fileContent;

        return <FileListItem className="app-message-content-file layer rounded flex-inline shadow-2 list-item" file={content} {...other}/>;
    }
}

export default MessageContentFileView;
