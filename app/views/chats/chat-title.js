import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import ChatAvatar from './chat-avatar';
import StatusDot from '../common/status-dot';
import MemberProfileDialog from '../common/member-profile-dialog';

class ChatTitle extends Component {

    render() {
        let {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const chatName = chat.getDisplayName(App, true);
        const theOtherOne = chat.isOne2One ? chat.getTheOtherOne(App) : null;
        const onTitleClick = theOtherOne ? MemberProfileDialog.show.bind(null, theOtherOne, null) : null;

        return <div className={HTML.classes('chat-title heading', className)}>
            <ChatAvatar chat={chat} size={24} className="state" onClick={onTitleClick}/>
            {theOtherOne && <StatusDot status={theOtherOne.status}/>}
            {
                theOtherOne ? <a className="strong rounded title flex-none text-primary" onClick={onTitleClick}>{chatName}</a> : <strong className="title flex-none">{chatName}</strong>
            }
            {chat.public && <small className="label rounded green label-sm">{Lang.string('chat.public.label')}</small>}
            <div className="flex-auto"></div>
            {children}
        </div>;
    }
}

export default ChatTitle;
