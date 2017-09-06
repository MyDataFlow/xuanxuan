import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import ChatView from './chat';

class ChatsCacheView extends Component {

    render() {
        let {
            chatId,
            filterType,
            className,
            style,
            children,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-chats-cache', className)}
            style={style}
        >
            {
                App.im.ui.activeAndMapCacheChats(chatId, chat => {
                    return <ChatView key={chat.gid} chat={chat} hidden={!App.im.ui.isActiveChat(chat.gid)}/>
                })
            }
            {children}
        </div>;
    }
}

export default ChatsCacheView;
