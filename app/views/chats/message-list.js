import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import MessageListItem from './message-list-item';

class MessageList extends Component {

    render() {
        let {
            messages,
            className,
            style,
            children,
            ...other
        } = this.props;

        let lastMessage = null;

        return <div {...other}
            className={HTML.classes('app-message-list', className)}
        >
        {
            messages && messages.map(message => {
                const messageListItem = <MessageListItem lastMessage={lastMessage} key={message.gid} message={message}/>;
                lastMessage = message;
                return messageListItem;
            })
        }
        </div>;
    }
}

export default MessageList;
