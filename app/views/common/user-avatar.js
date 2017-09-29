import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Avatar from '../../components/avatar';
import HTML from '../../utils/html-helper';
import StatusDot from './status-dot';
import App from '../../core';

class UserAvatar extends Component {

    render() {
        let {
            user,
            className,
            showStatusDot,
            ...other
        } = this.props;

        let statusDot = null;
        if(showStatusDot) {
            statusDot = <StatusDot status={user.status}/>
        }

        if(!user) {
            return <Avatar className={HTML.classes('circle', className)} icon="account" {...other}>{statusDot}</Avatar>;
        }

        let avatarImageSrc = user.getAvatar(App.user && App.user.server);
        if(avatarImageSrc) {
            avatarImageSrc = avatarImageSrc + '?' + App.profile.sessionId;
            return <Avatar className={HTML.classes('circle', className)} image={avatarImageSrc} imageClassName="circle" {...other}>{statusDot}</Avatar>;
        }
        const name = user.realname || user.account;
        if(name && name.length) {
            return <Avatar skin={{code: user.id || name, textColor: '#fff'}} className={HTML.classes('circle', className)} label={name[0].toUpperCase()} {...other}>{statusDot}</Avatar>;
        } else {
            return <Avatar skin={{code: user.id, textColor: '#fff'}} className={HTML.classes('circle', className)} icon="account" {...other}>{statusDot}</Avatar>;
        }
    }
}

export default UserAvatar;
