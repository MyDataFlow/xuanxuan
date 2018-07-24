import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Avatar from '../../components/avatar';
import HTML from '../../utils/html-helper';
import App from '../../core';
import {StatusDot} from './status-dot';
import replaceViews from '../replace-views';

class UserAvatar extends Component {
    static get UserAvatar() {
        return replaceViews('common/user-avatar', UserAvatar);
    }

    static propTypes = {
        user: PropTypes.object,
        className: PropTypes.string,
        showStatusDot: PropTypes.bool,
    };

    static defaultProps = {
        className: null,
        showStatusDot: null,
        user: null,
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.className !== this.props.className || nextProps.user !== this.props.user || !nextProps.user || !this.props.user || nextProps.user.status !== this.props.user.status || nextProps.user.avatar !== this.props.user.avatar || nextProps.user.realname !== this.props.user.realname;
    }

    render() {
        const {
            user,
            className,
            showStatusDot,
            ...other
        } = this.props;

        let statusDot = null;
        if (showStatusDot) {
            statusDot = <StatusDot status={user.status} />;
        }

        if (!user) {
            return <Avatar className={HTML.classes('circle user-avatar', className)} icon="account" {...other}>{statusDot}</Avatar>;
        }

        const avatarImageSrc = user.getAvatar(App.user && App.user.server);
        if (avatarImageSrc) {
            return <Avatar className={HTML.classes('circle user-avatar', className)} image={avatarImageSrc} imageClassName="circle" {...other}>{statusDot}</Avatar>;
        }
        const name = user.realname || user.account;
        if (name && name.length) {
            return <Avatar skin={{code: user.id || name, textColor: '#fff'}} className={HTML.classes('circle user-avatar', className)} label={name[0].toUpperCase()} {...other}>{statusDot}</Avatar>;
        }
        return <Avatar skin={{code: user.id, textColor: '#fff'}} className={HTML.classes('circle user-avatar', className)} icon="account" {...other}>{statusDot}</Avatar>;
    }
}

export default UserAvatar;
