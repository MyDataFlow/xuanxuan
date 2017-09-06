import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import FileListItem from './file-list-item';

class FileList extends Component {

    render() {
        let {
            files,
            className,
            children,
            listItemProps,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-file-list list', className)}
        >
        {
            files.map(file => {
                return <FileListItem {...listItemProps} key={file.id} file={file}/>;
            })
        }
        </div>;
    }
}

export default FileList;
