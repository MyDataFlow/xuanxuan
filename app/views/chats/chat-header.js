import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import ChatAvatar from './chat-avatar';
import StatusDot from '../common/status-dot';
import MemberProfileDialog from '../common/member-profile-dialog';

class ChatHeader extends Component {

    render() {
        let {
            chat,
            className,
            children,
            showSidebarIcon,
            ...other
        } = this.props;

        const chatName = chat.getDisplayName(App, true);
        const theOtherOne = chat.isOne2One ? chat.getTheOtherOne(App) : null;

        return <div {...other}
            className={HTML.classes('app-chat-header flex flex-wrap space-between shadow-divider', className)}
        >
            <div className="flex flex-middle heading" onClick={theOtherOne ? MemberProfileDialog.show.bind(null, theOtherOne, null) : null}>
                <ChatAvatar chat={chat} size={24}/>
                {theOtherOne && <StatusDot status={theOtherOne.status}/>}
                {
                    theOtherOne ? <a className="strong rounded title text-primary">{chatName}</a> : <strong className="title">{chatName}</strong>
                }
                {chat.public && <small className="label rounded green label-sm">{Lang.string('chat.public.label')}</small>}
            </div>
            <div className="toolbar flex flex-middle text-rigth rounded">
            {
                App.im.ui.createChatToolbarItems(chat, showSidebarIcon).map(item => {
                    return <div key={item.id} className={`hint--${item.hintPosition || 'bottom'} has-padding-sm`} data-hint={item.label} onClick={item.click}><button className="btn iconbutton rounded" type="button"><Icon className="icon-2x" name={item.icon}/></button></div>
                })
            }
            </div>
        </div>;
    }
}

export default ChatHeader;
