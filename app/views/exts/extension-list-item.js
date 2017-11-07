import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Avatar from '../../components/avatar';

export default class ExtensionListItem extends Component {
    static propTypes = {
        className: PropTypes.string,
        extension: PropTypes.object.isRequired,
    };

    static defaultProps = {
        className: null,
    };

    render() {
        const {
            extension,
            className,
            ...other,
        } = this.props;

        return (<a className={HTML.classes('app-ext-list-item', className)} {...other}>
            <Avatar className="rounded shadow-1" auto={extension.icon} skin={{code: extension.accentColor}} />
            <div className="content">
                <div className="title"><strong>{extension.displayName}</strong> &nbsp; <small className="text-gray">{extension.version}</small></div>
                <div className="small">{extension.description}</div>
                <div className="text-gray small">{extension.author}</div>
            </div>
        </a>);
    }
}
