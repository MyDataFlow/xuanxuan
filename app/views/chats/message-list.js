import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import MessageListItem from './message-list-item';

class MessageList extends Component {

    static defaultProps = {
        showDateDivider: 0,
    };

    scrollToBottom = (utilTime = 0) => {
        this.messageEndEle.scrollIntoView({block: 'end', behavior: 'instant'});

        const now = new Date().getTime();
        if(utilTime) {
            this.shouldStayInBottom = now + utilTime;
        }
        if(!this.stayToBottomInterval && this.shouldStayInBottom && this.shouldStayInBottom > now) {
            this.stayToBottomInterval = setInterval(() => {
                const time = new Date().getTime();
                if(this.shouldStayInBottom && this.shouldStayInBottom > time) {
                    this.scrollToBottom();
                } else {
                    clearInterval(this.stayToBottomInterval);
                    this.stayToBottomInterval = null;
                }
            }, 50);
        }
    }

    componentDidMount() {
        this.scrollToBottom(1500);
    }

    componentWillUnmount() {
        clearInterval(this.stayToBottomInterval);
    }

    componentDidUpdate() {
        const {messages} = this.props;
        if(this.checkHasNewMessages(messages)) {
            this.scrollToBottom(1000);
        }
    }

    handleListScrollEvent = e => {
        const listEle = e.target;
        // this.shouldStayInBottom = (listEle.scrollTop + listEle.offsetHeight) === listEle.scrollHeight;
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
            showDateDivider,
            font,
            children,
            listItemProps,
            ...other
        } = this.props;

        let lastMessage = null;

        return <div {...other}
            className={HTML.classes('app-message-list', className)}
            onScroll={this.handleListScrollEvent}
        >
            {
                messages && messages.map(message => {
                    const messageListItem = <MessageListItem font={font} showDateDivider={showDateDivider} lastMessage={lastMessage} key={message.gid} message={message} {...listItemProps}/>;
                    lastMessage = message;
                    return messageListItem;
                })
            }
            <div className="scroll-root-ele" ref={e => this.messageEndEle = e}></div>
        </div>;
    }
}

export default MessageList;
