import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import MessageList from './message-list';
import App from '../../core';

class ChatMessages extends Component {

    render() {
        let {
            chat,
            className,
            style,
            children,
            ...other
        } = this.props;

        const font = App.profile.userConfig.chatFontSize;

        return <div {...other}
            className={HTML.classes('app-chat-messages white', className)}
        >
            <MessageList font={font} className="dock scroll-y user-selectable" messages={chat.messages}/>
        </div>;
    }
}

export default ChatMessages;
