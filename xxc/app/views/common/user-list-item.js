import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import {UserAvatar} from './user-avatar';
import replaceViews from '../replace-views';

export default class UserListItem extends Component {
    static get UserListItem() {
        return replaceViews('common/user-list-item', UserListItem);
    }

    static propTypes = {
        user: PropTypes.object.isRequired,
        className: PropTypes.string,
        avatarSize: PropTypes.number,
        avatarClassName: PropTypes.string,
        children: PropTypes.any,
    }

    static defaultProps = {
        avatarSize: 30,
        className: 'flex-middle',
        avatarClassName: null,
        children: null,
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.children !== this.props.children || nextProps.className !== this.props.className || nextProps.avatarSize !== this.props.avatarSize || nextProps.avatarClassName !== this.props.avatarClassName || nextProps.user !== this.props.user || nextProps.user.account !== this.props.user.account || nextProps.user.avatar !== this.props.user.avatar || nextProps.user.realname !== this.props.user.realname || nextProps.user.server !== this.props.user.server;
    }

    render() {
        const {
            user,
            avatarSize,
            avatarClassName,
            className,
            children,
            ...other
        } = this.props;

        return (<a
            {...other}
            className={HTML.classes('app-user-list-item item', className)}
        >
            <UserAvatar className={avatarClassName} size={avatarSize} user={user} />
            <div className="content">
                <div className="title">{user.displayName} <small className="muted">@{user.account}</small></div>
                <div className="subtitle">{user.serverUrl}</div>
            </div>
            {children}
        </a>);
    }
}
