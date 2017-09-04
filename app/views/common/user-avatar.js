import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Avatar from '../../components/avatar';
import HTML from '../../utils/html-helper';
import StatusDot from './status-dot';

const getCodeFromString = (str) => {
    if(!str) {
        return 0;
    }
    return str.split('')
        .map(char => char.charCodeAt(0))
        .reduce((current, previous) => previous + current);
};

const getColorFromCode = (code) => {
    return `hsl(${(code * 43) % 360}, 70%, 60%)`;
};

class UserAvatar extends Component {

    render() {
        let {
            user,
            style,
            className,
            showStatusDot,
            ...other
        } = this.props;

        let statusDot = null;
        if(showStatusDot) {
            statusDot = <StatusDot status={user.status}/>
        }

        if(!user) {
            return <Avatar className={HTML.classes('circle', className)} icon="account" style={style} {...other}>{statusDot}</Avatar>;
        }

        const avatarImageSrc = user.avatar;
        if(avatarImageSrc) {
            return <Avatar className={HTML.classes('circle', className)} image={avatarImageSrc} style={style} {...other}>{statusDot}</Avatar>;
        }
        const name = user.realname || user.account;
        style = Object.assign({
            color: '#fff',
            fontWeight: 'lighter',
            backgroundColor: getColorFromCode(getCodeFromString(name))
        }, style);
        if(name && name.length) {
            return <Avatar className={HTML.classes('circle', className)} label={name[0].toUpperCase()} style={style} {...other}>{statusDot}</Avatar>;
        } else {
            return <Avatar className={HTML.classes('circle', className)} icon="account" style={style} {...other}>{statusDot}</Avatar>;
        }
    }
}

export default UserAvatar;
