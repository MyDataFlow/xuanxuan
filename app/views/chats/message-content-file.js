import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import FileListItem from '../common/file-list-item';

class MessageContentFileView extends Component {
    static propTypes = {
        className: PropTypes.string,
        message: PropTypes.object.isRequired,
    };

    static defaultProps = {
        className: null,
    };

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

export default MessageContentFileView;
