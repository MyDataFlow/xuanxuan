import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import UserAvatar from './user-avatar';

class UserListItem extends Component {

    static defaultProps = {
        avatarSize: 30,
        className: 'flex-middle'
    };

    render() {
        let {
            user,
            avatarSize,
            avatarClassName,
            className,
            children,
            ...other
        } = this.props;

        return <a {...other}
            className={HTML.classes('app-user-list-item item', className)}
        >
            <UserAvatar className={avatarClassName} size={avatarSize} user={user}/>
            <div className="content">
                <div className="title">{user.displayName} <small className="muted">@{user.account}</small></div>
                <div className="subtitle">{user.serverUrl}</div>
            </div>
            {children}
        </a>;
    }
}

export default UserListItem;
