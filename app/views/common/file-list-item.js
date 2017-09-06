import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';

class FileListItem extends Component {

    static defaultProps = {
        className: 'flex-middle'
    };

    render() {
        let {
            file,
            className,
            children,
            ...other
        } = this.props;

        return <a {...other}
            className={HTML.classes('app-file-list-item item', className)}
        >
            <UserAvatar className={avatarClassName} size={avatarSize} user={file}/>
            {showStatusDot && <StatusDot status={file.status}/>}
            <span>{file.displayName}</span>
        </a>;
    }
}

export default FileListItem;
