import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import {ChatAvatar} from './chat-avatar';
import {StatusDot} from '../common/status-dot';
import MemberProfileDialog from '../common/member-profile-dialog';
import replaceViews from '../replace-views';

class ChatTitle extends Component {
    static get ChatTitle() {
        return replaceViews('chats/chat-title', ChatTitle);
    }

    static propTypes = {
        className: PropTypes.string,
        chat: PropTypes.object,
        children: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        chat: null,
        children: null,
    };

    shouldComponentUpdate(nextProps) {
        return (this.props.className !== nextProps.className ||
            this.props.children !== nextProps.children ||
            this.props.chat !== nextProps.chat || this.lastChatUpdateId !== nextProps.chat.updateId ||
            (nextProps.chat.isOne2One && nextProps.chat.getTheOtherOne(App).updateId !== this.lastOtherOneUpdateId)
        );
    }

    render() {
        const {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const chatName = chat.getDisplayName(App, true);
        const theOtherOne = chat.isOne2One ? chat.getTheOtherOne(App) : null;
        const onTitleClick = theOtherOne ? MemberProfileDialog.show.bind(null, theOtherOne, null) : null;
        this.lastOtherOneUpdateId = theOtherOne && theOtherOne.updateId;
        this.lastChatUpdateId = chat.updateId;

        return (<div className={classes('chat-title heading', className)} {...other}>
            <ChatAvatar chat={chat} size={24} className={theOtherOne ? 'state' : ''} onClick={onTitleClick} />
            {theOtherOne && <StatusDot status={theOtherOne.status} />}
            {
                theOtherOne ? <a className="strong rounded title flex-none text-primary" onClick={onTitleClick}>{chatName}</a> : <strong className="title flex-none">{chatName}</strong>
            }
            {chat.public && <div className="hint--bottom" data-hint={Lang.string('chat.public.label')}><Icon className="text-green" name="access-point" /></div>}
            {chat.mute && <div className="hint--bottom" data-hint={Lang.string('chat.mute.label')}><Icon className="text-brown" name="bell-off" /></div>}
            {chat.isDismissed && <div className="small label rounded dark">{Lang.string('chat.group.dismissed')}</div>}
            {chat.isDeleteOne2One && <div className="small label rounded dark">{Lang.string('chat.deleted')}</div>}
            <div className="flex-auto" />
            {children}
        </div>);
    }
}

export default ChatTitle;
