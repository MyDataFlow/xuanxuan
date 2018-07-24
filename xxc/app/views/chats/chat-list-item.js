import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {classes} from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import ROUTES from '../common/routes';
import {ChatAvatar} from './chat-avatar';
import App from '../../core';
import replaceViews from '../replace-views';

class ChatListItem extends Component {
    static get ChatListItem() {
        return replaceViews('chats/chat-list-item', ChatListItem);
    }

    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.any,
        chat: PropTypes.object,
        filterType: PropTypes.string,
        badge: PropTypes.any,
        notUserLink: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        children: null,
        chat: null,
        filterType: null,
        badge: null,
        notUserLink: false,
    };

    shouldComponentUpdate(nextProps) {
        return (this.props.className !== nextProps.className ||
            this.props.children !== nextProps.children ||
            this.props.chat !== nextProps.chat || this.lastChatUpdateId !== nextProps.chat.updateId ||
            (nextProps.chat.isOne2One && nextProps.chat.getTheOtherOne(App).updateId !== this.lastOtherOneUpdateId) ||
            this.props.filterType !== nextProps.filterType ||
            this.props.badge !== nextProps.badge ||
            this.props.notUserLink !== nextProps.notUserLink ||
            this.lastChatIsActive !== App.im.ui.isActiveChat(nextProps.chat.gid)
        );
    }

    render() {
        let {
            chat,
            filterType,
            className,
            badge,
            children,
            notUserLink,
            ...other
        } = this.props;

        this.lastChatUpdateId = chat.updateId;
        this.lastChatIsActive = App.im.ui.isActiveChat(chat.gid);

        const name = chat.getDisplayName(App);
        let subname = null;
        if (chat.isOne2One) {
            const theOtherOne = chat.getTheOtherOne(App);
            this.lastOtherOneUpdateId = theOtherOne.updateId;
            if (theOtherOne.isOffline) {
                subname = `[${Lang.string('member.status.offline')}]`;
            }
        } else if (chat.isSystem) {
            if (chat.isRobot) {
                subname = `(${Lang.string('common.littlexxSubname')})`;
            } else {
                subname = `(${Lang.format('chat.membersCount.format', Lang.string('chat.all'))})`;
            }
        } else if (chat.isGroup) {
            subname = `(${Lang.format('chat.membersCount.format', chat.membersCount)})`;
        }

        if (!badge && badge !== false) {
            const noticeCount = chat.noticeCount;
            if (noticeCount) {
                badge = <div className={classes('label circle label-sm', chat.isMuteOrHidden ? 'blue' : 'red')}>{noticeCount > 99 ? '99+' : noticeCount}</div>;
            } else if (chat.mute) {
                badge = <Icon name="bell-off" className="muted" />;
            } else if (chat.star) {
                badge = <Icon name="star" className="icon-sm muted" />;
            }
        }

        if (notUserLink) {
            return (<a
                href={notUserLink === 'disabled' ? null : `#${ROUTES.chats.chat.id(chat.gid, filterType)}`}
                className={classes('app-chat-item flex-middle', className, {active: notUserLink !== 'disabled' && this.lastChatIsActive})}
                {...other}
            >
                <ChatAvatar chat={chat} avatarClassName="avatar-sm" avatarSize={24} grayOffline className="flex-none" />
                <div className="title text-ellipsis">
                    {name}
                    {subname && <small className="muted">&nbsp; {subname}</small>}
                </div>
                {badge && <div className="flex-none">{badge}</div>}
                {children}
            </a>);
        }
        return (<Link
            to={ROUTES.chats.chat.id(chat.gid, filterType)}
            className={classes('app-chat-item flex-middle', className, {active: this.lastChatIsActive})}
            {...other}
        >
            <ChatAvatar chat={chat} avatarClassName="avatar-sm" avatarSize={24} grayOffline className="flex-none" />
            <div className="title text-ellipsis">
                {name}
                {subname && <small className="muted">&nbsp; {subname}</small>}
            </div>
            {badge && <div className="flex-none">{badge}</div>}
            {children}
        </Link>);
    }
}

export default ChatListItem;
