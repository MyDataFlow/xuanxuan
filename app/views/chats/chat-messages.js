import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import MessageList from './message-list';

class ChatMessages extends Component {

    render() {
        let {
            chat,
            className,
            style,
            children,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-chat-messages white', className)}
        >
            <MessageList className="dock scroll-y user-selectable" messages={chat.messages}/>
        </div>;
    }
}

export default ChatMessages;
