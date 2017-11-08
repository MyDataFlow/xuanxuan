import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Avatar from '../../components/avatar';
import Button from '../../components/button';

export default class ExtensionListItem extends Component {
    static propTypes = {
        className: PropTypes.string,
        extension: PropTypes.object.isRequired,
        onSettingBtnClick: PropTypes.func
    };

    static defaultProps = {
        className: null,
        onSettingBtnClick: null,
    };

    render() {
        const {
            extension,
            className,
            onSettingBtnClick,
            ...other,
        } = this.props;

        return (<a className={HTML.classes('app-ext-list-item', className)} {...other}>
            <Avatar className="rounded shadow-1 flex-none" auto={extension.icon} skin={{code: extension.accentColor}} />
            <div className="content">
                <div className="title"><strong>{extension.displayName}</strong> &nbsp; <small className="text-gray">{extension.version}</small></div>
                <div className="small text-ellipsis">{extension.description}</div>
                <div className="text-gray small">{extension.author}</div>
            </div>
            {}
            <Button onClick={onSettingBtnClick} icon="settings" className="iconbutton rounded primary outline" />
        </a>);
    }
}
