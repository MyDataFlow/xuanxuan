import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import Icon from '../../components/icon';
import App from '../../core';
import Chat from '../../core/models/chat';
import {UserAvatar} from '../common/user-avatar';
import replaceViews from '../replace-views';

const chatIcons = {
    robot: {name: 'robot', colorClass: 'text-accent'},
    group: {name: 'comment-multiple-outline', colorClass: 'text-info'},
    'public-group': {name: 'pound-box', colorClass: 'text-green'},
    'system-group': {name: 'comment-text', colorClass: 'text-primary'}
};

class ChatAvatar extends Component {
    static get ChatAvatar() {
        return replaceViews('chats/chat-avatar', ChatAvatar);
    }

    static propTypes = {
        chat: PropTypes.instanceOf(Chat),
        grayOffline: PropTypes.bool,
        className: PropTypes.string,
        avatarSize: PropTypes.number,
        iconSize: PropTypes.number,
        avatarClassName: PropTypes.string,
        iconClassName: PropTypes.string,
    };

    static defaultProps = {
        chat: null,
        grayOffline: false,
        className: null,
        avatarSize: null,
        iconSize: null,
        avatarClassName: null,
        iconClassName: null,
    };

    shouldComponentUpdate(nextProps) {
        const nextChat = nextProps.chat;
        const chat = this.props.chat;
        if (chat !== nextChat || this.lastChatUpdateId !== nextChat.updateId) {
            return true;
        }
        if (nextProps.grayOffline && nextChat.isOne2One && nextChat.getTheOtherOne(App).updateId !== this.lastOtherOneUpdateId) {
            return true;
        }
        return false;
    }

    render() {
        const {
            chat,
            grayOffline,
            className,
            avatarSize,
            iconSize,
            avatarClassName,
            iconClassName,
            ...other
        } = this.props;


        if (chat.isOne2One) {
            const theOtherOne = chat.getTheOtherOne(App);
            this.lastOtherOneUpdateId = theOtherOne.updateId;
            const grayscale = grayOffline && (theOtherOne.isOffline || !App.profile.isUserOnline);
            return <UserAvatar size={avatarSize} user={theOtherOne} className={classes(className, avatarClassName, {grayscale})} {...other} />;
        }
        let icon = null;
        if (chat.isSystem) {
            icon = chat.isRobot ? chatIcons.robot : chatIcons['system-group'];
        } else if (chat.public) {
            icon = chatIcons['public-group'];
        } else {
            icon = chatIcons.group;
        }
        this.lastChatUpdateId = chat.updateId;
        
        return <Icon size={iconSize} name={`${icon.name} icon-2x`} className={classes(className, iconClassName, icon.colorClass)} {...other} />;
    }
}

export default ChatAvatar;
