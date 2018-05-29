import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import {MessageListItem} from './message-list-item';
import replaceViews from '../replace-views';
import App from '../../core';

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
        header: PropTypes.any,
        onScroll: PropTypes.func,
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
        header: null,
        onScroll: null,
    };

    static get MessageList() {
        return replaceViews('chats/message-list', MessageList);
    }

    componentDidMount() {
        if (this.props.stayBottom) {
            this.scrollToBottom();
        }
        this.onChatActiveHandler = App.im.ui.onActiveChat(chat => {
            if (this.lastMessage && (this.waitNewMessage || this.isScrollBottom) && this.lastMessage.cgid === chat.gid) {
                this.waitNewMessage = null;
                this.scrollToBottom(500);
            }
        });
    }

    componentDidUpdate() {
        if (this.props.stayBottom) {
            const {messages} = this.props;
            const newMessage = this.checkHasNewMessages(messages);
            if (newMessage) {
                if (App.im.ui.isActiveChat(newMessage.cgid)) {
                    if (newMessage.isSender(App.profile.userId) || this.isScrollBottom) {
                        this.scrollToBottom(100);
                    }
                } else {
                    this.waitNewMessage = newMessage;
                }
            } else {
                const lastFirstMessage = this.checkHasNewOlderMessages(messages);
                if (lastFirstMessage) {
                    const lastFirstMessageEle = document.getElementById(`message-${lastFirstMessage.gid}`);
                    if (lastFirstMessageEle) {
                        lastFirstMessageEle.scrollIntoView({block: 'end', behavior: 'instant'});
                    }
                } else if (this.isScrollBottom) {
                    this.scrollToBottom(100);
                }
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.stayToBottomInterval);
        App.events.off(this.onChatActiveHandler);
    }

    scrollToBottom = (utilTime = 0) => {
        this.messageEndEle.scrollIntoView({block: 'end', behavior: 'instant'});
        if (!utilTime) {
            return;
        }

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
        const lastMessage = this.lastMessage;
        const thisLastMessage = messages && messages.length ? messages[messages.length - 1] : null;
        this.lastMessage = thisLastMessage;
        if (lastMessage !== thisLastMessage && thisLastMessage && ((!lastMessage && thisLastMessage) || thisLastMessage.date > lastMessage.date || thisLastMessage.id > lastMessage.id)) {
            return thisLastMessage;
        }
        return false;
    }

    checkHasNewOlderMessages(messages) {
        const lastFirstMessage = this.lastFirstMessage;
        const thisFirstMessage = messages && messages.length ? messages[0] : null;
        this.lastFirstMessage = thisFirstMessage;
        if (thisFirstMessage && lastFirstMessage && (thisFirstMessage.date < lastFirstMessage.date || thisFirstMessage.id < lastFirstMessage.id)) {
            return lastFirstMessage;
        }
    }

    handleScroll = e => {
        const target = e.target;
        const scrollInfo = {
            isAtTop: target.scrollTop === 0,
            isAtBottom: (target.scrollHeight - target.scrollTop) === target.clientHeight
        };
        this.scrollInfo = scrollInfo;
        if (this.props.onScroll) {
            this.props.onScroll(scrollInfo, e);
        }
    }

    get isScrollBottom() {
        return this.scrollInfo ? this.scrollInfo.isAtBottom : true;
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
            header,
            onScroll,
            ...other
        } = this.props;

        let lastMessage = null;

        return (<div
            {...other}
            className={HTML.classes('app-message-list', className, {'app-message-list-static': staticUI})}
            onScroll={this.handleScroll}
        >
            {header}
            {
                messages && messages.map(message => {
                    const messageListItem = listItemCreator ? listItemCreator(message, lastMessage) : <MessageListItem id={`message-${message.gid}`} staticUI={staticUI} font={font} showDateDivider={showDateDivider} lastMessage={lastMessage} key={message.gid} message={message} {...listItemProps} />;
                    lastMessage = message;
                    return messageListItem;
                })
            }
            <div className="scroll-root-ele" ref={e => {this.messageEndEle = e;}} />
        </div>);
    }
}

export default MessageList;
