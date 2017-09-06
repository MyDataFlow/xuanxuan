import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import MessageListItem from './message-list-item';

class MessageList extends Component {

    scrollToBottom = (smooth) => {
        this.messageEndEle.scrollIntoView({block: 'end', behavior: smooth ? 'smooth' : 'instant'});
    }

    componentDidMount() {
        this.scrollToBottom();
        this.shouldStayInBottom = true;
    }

    componentDidUpdate() {
        if(this.shouldStayInBottom) {
            this.scrollToBottom();
        }
    }

    handleListScrollEvent = e => {
        const listEle = e.target;
        this.shouldStayInBottom = (listEle.scrollTop + listEle.offsetHeight) === listEle.scrollHeight;
    }

    checkHasNewMessages(messages) {
        if(!this.lastMessage || !messages || !messages.length) {
            return true;
        }
        const thisLastMessage = messages[messages.length - 1];
        if(thisLastMessage.date > this.lastMessage.date || thisLastMessage.id > this.lastMessage.id) {
            return true;
        }
    }

    render() {
        let {
            messages,
            className,
            style,
            children,
            ...other
        } = this.props;

        let lastMessage = null;
        if(this.checkHasNewMessages(messages)) {
            this.shouldStayInBottom = true;
        }

        return <div {...other}
            className={HTML.classes('app-message-list', className)}
            onScroll={this.handleListScrollEvent}
        >
            {
                messages && messages.map(message => {
                    const messageListItem = <MessageListItem lastMessage={lastMessage} key={message.gid} message={message}/>;
                    lastMessage = message;
                    return messageListItem;
                })
            }
            <div className="space-sm" ref={e => this.messageEndEle = e}></div>
        </div>;
    }
}

export default MessageList;
