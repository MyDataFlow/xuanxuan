import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import {Link, Route} from 'react-router-dom';
import ROUTES from '../common/routes';
import ChatAvatar from './chat-avatar';
import App from '../../core';

class ChatListItem extends Component {

    render() {
        let {
            chat,
            filterType,
            className,
            style,
            badge,
            children,
            notUserLink,
            ...other
        } = this.props;

        const name = chat.getDisplayName(App);
        let subname = null;
        if(chat.isOne2One) {
            const theOtherOne = chat.getTheOtherOne(App);
            if(theOtherOne.isOffline) {
                subname = `[${Lang.string('member.status.offline')}]`;
            }
        } else if(chat.isSystem) {
            subname = `(${Lang.format('chat.membersCount.format', Lang.string('chat.all'))})`;
        } else if(chat.isGroup) {
            subname = `(${Lang.format('chat.membersCount.format', chat.membersCount)})`;
        }

        if(!badge && badge !== false) {
            const noticeCount = chat.noticeCount;
            if(noticeCount) {
                badge = <div className="label circle red label-sm">{noticeCount > 99 ? '99+' : noticeCount}</div>;
            } else if(chat.star) {
                badge = <Icon name="star" className="icon-sm muted"/>;
            }
        }

        if(notUserLink) {
            return <a
                href={notUserLink === 'disabled' ? null : ('#' + ROUTES.chats.chat.id(chat.gid, filterType))}
                className={HTML.classes('app-chat-item flex-middle', className, {active: notUserLink !== 'disabled' && App.im.ui.isActiveChat(chat.gid)})}
                style={style}
                {...other}
            >
                <ChatAvatar chat={chat} avatarClassName="avatar-sm" avatarSize={24} grayOffline={true} className="flex-none"/>
                <div className="title text-ellipsis">
                    {name}
                    {subname && <small className="muted">&nbsp; {subname}</small>}
                </div>
                {badge && <div className="flex-none">{badge}</div>}
                {children}
            </a>;
        } else {
            return <Link
                to={ROUTES.chats.chat.id(chat.gid, filterType)}
                className={HTML.classes('app-chat-item flex-middle', className, {active: App.im.ui.isActiveChat(chat.gid)})}
                style={style}
                {...other}
            >
                <ChatAvatar chat={chat} avatarClassName="avatar-sm" avatarSize={24} grayOffline={true} className="flex-none"/>
                <div className="title text-ellipsis">
                    {name}
                    {subname && <small className="muted">&nbsp; {subname}</small>}
                </div>
                {badge && <div className="flex-none">{badge}</div>}
                {children}
            </Link>;
        }
    }
}

export default ChatListItem;
