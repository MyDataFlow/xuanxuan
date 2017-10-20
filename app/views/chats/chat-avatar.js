import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import Avatar from '../../components/avatar';
import UserAvatar from '../common/user-avatar';
import App from '../../core';

const chatIcons = {
    'group': {name: 'comment-multiple-outline', colorClass: 'text-info'},
    'public-group': {name: 'pound-box', colorClass: 'text-green'},
    'system-group': {name: 'comment-text', colorClass: 'text-primary'}
};

class ChatAvatar extends Component {

    render() {
        let {
            chat,
            grayOffline,
            className,
            avatarSize,
            iconSize,
            avatarClassName,
            iconClassName,
            ...other
        } = this.props;


        if(chat.isOne2One) {
            const theOtherOne = chat.getTheOtherOne(App);
            if(grayOffline && (theOtherOne.isOffline || !App.profile.isUserOnline)) {
                className = HTML.classes(className, 'grayscale');
            }
            return <UserAvatar size={avatarSize} user={theOtherOne} className={HTML.classes(className, avatarClassName)} {...other}/>;
        } else {
            let icon = chat.isSystem ? chatIcons['system-group'] : chat.public ? chatIcons['public-group'] : chatIcons['group'];
            return <Icon size={iconSize} name={icon.name + ' icon-2x'} className={HTML.classes(className, iconClassName, icon.colorClass)} {...other}/>
        }
    }
}

export default ChatAvatar;
