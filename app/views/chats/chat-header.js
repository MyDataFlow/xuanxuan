import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import ChatTitle from './chat-title';

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
            <ChatTitle chat={chat} className="flex flex-middle"/>
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
