import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import {MessageListItem} from './message-list-item';
import replaceViews from '../replace-views';

class MessageList extends Component {
    static propTypes = {
        messages: PropTypes.array.isRequired,
        stayBottom: PropTypes.bool,
        staticUI: PropTypes.bool,
        showDateDivider: PropTypes.any,
        className: PropTypes.string,
        font: PropTypes.object,
        listItemProps: PropTypes.object,
        children: PropTypes.any,
        listItemCreator: PropTypes.func,
    };

    static defaultProps = {
        showDateDivider: 0,
        stayBottom: true,
        staticUI: false,
        className: null,
        font: null,
        listItemProps: null,
        children: null,
        listItemCreator: null,
    };

    static get MessageList() {
        return replaceViews('chats/message-list', MessageList);
    }

    componentDidMount() {
        if (this.props.stayBottom) {
            this.scrollToBottom(800);
        }
    }

    componentDidUpdate() {
        if (this.props.stayBottom) {
            const {messages} = this.props;
            if (this.checkHasNewMessages(messages)) {
                this.scrollToBottom(500);
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.stayToBottomInterval);
    }

    scrollToBottom = (utilTime = 0) => {
        this.messageEndEle.scrollIntoView({block: 'end', behavior: 'instant'});

        const now = new Date().getTime();
        if (utilTime) {
            this.shouldStayInBottom = now + utilTime;
        }
        if (!this.stayToBottomInterval && this.shouldStayInBottom && this.shouldStayInBottom > now) {
            this.stayToBottomInterval = setInterval(() => {
                const time = new Date().getTime();
                if (this.shouldStayInBottom && this.shouldStayInBottom > time) {
                    this.scrollToBottom();
                } else {
                    clearInterval(this.stayToBottomInterval);
                    this.stayToBottomInterval = null;
                }
            }, 50);
        }
    }

    checkHasNewMessages(messages) {
        if (!this.lastMessage || !messages || !messages.length) {
            return true;
        }
        const thisLastMessage = messages[messages.length - 1];
        if (thisLastMessage.date > this.lastMessage.date || thisLastMessage.id > this.lastMessage.id) {
            return true;
        }
    }

    render() {
        const {
            messages,
            className,
            showDateDivider,
            font,
            stayBottom,
            children,
            listItemProps,
            listItemCreator,
            staticUI,
            ...other
        } = this.props;

        let lastMessage = null;

        return (<div
            {...other}
            className={HTML.classes('app-message-list', className, {'app-message-list-static': staticUI})}
        >
            {
                messages && messages.map(message => {
                    const messageListItem = listItemCreator ? listItemCreator(message, lastMessage) : <MessageListItem staticUI={staticUI} font={font} showDateDivider={showDateDivider} lastMessage={lastMessage} key={message.gid} message={message} {...listItemProps} />;
                    lastMessage = message;
                    return messageListItem;
                })
            }
            <div className="scroll-root-ele" ref={e => {this.messageEndEle = e;}} />
        </div>);
    }
}

export default MessageList;
