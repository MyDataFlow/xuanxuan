import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import {FileListItem} from './file-list-item';
import replaceViews from '../replace-views';
import ListItem from '../../components/list-item';
import Lang from '../../lang';

class FileList extends Component {
    static get FileList() {
        return replaceViews('common/file-list', FileList);
    }

    static propTypes = {
        files: PropTypes.array.isRequired,
        listItemProps: PropTypes.object,
        className: PropTypes.string,
        startPageSize: PropTypes.number,
        morePageSize: PropTypes.number,
        defaultPage: PropTypes.number,
    };

    static defaultProps = {
        className: null,
        listItemProps: null,
        startPageSize: 20,
        morePageSize: 10,
        defaultPage: 1,
    };

    constructor(props) {
        super(props);
        this.state = {page: props.defaultPage};
    }

    handleRequestMorePage = () => {
        this.setState({page: this.state.page + 1});
    };

    render() {
        const {
            files,
            className,
            listItemProps,
            startPageSize,
            morePageSize,
            defaultPage,
            ...other
        } = this.props;

        const listViews = [];
        if (files) {
            const {page} = this.state;
            const maxIndex = page ? Math.min(files.length, startPageSize + (page > 1 ? (page - 1) * morePageSize : 0)) : files.length;
            for (let i = 0; i < maxIndex; i += 1) {
                const file = files[i];
                let itemProps = null;
                if (typeof listItemProps === 'function') {
                    itemProps = listItemProps(file);
                } else {
                    itemProps = listItemProps;
                }
                listViews.push(<FileListItem {...itemProps} key={file.id} file={file} />);
            }
            const notShowCount = files.length - maxIndex;
            if (notShowCount) {
                listViews.push(<ListItem key="showMore" icon="chevron-double-down" className="flex-middle item muted" title={<span className="title small">{Lang.format('common.clickShowMoreFormat', notShowCount)}</span>} onClick={this.handleRequestMorePage} />);
            }
        }

        return (<div
            {...other}
            className={HTML.classes('app-file-list list', className)}
        >{listViews}</div>);
    }
}

export default FileList;
