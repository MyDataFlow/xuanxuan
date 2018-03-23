import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import App from '../../core';
import {MessageList} from './message-list';
import replaceViews from '../replace-views';

class ChatMessages extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.any,
        chat: PropTypes.object,
    };

    static defaultProps = {
        className: null,
        children: null,
        chat: null,
    };

    static get ChatMessages() {
        return replaceViews('chats/chat-messages', ChatMessages);
    }

    // shouldComponentUpdate(nextProps) {
    //     return this.props.className !== nextProps.className || this.props.children !== nextProps.children || this.props.chat !== nextProps.chat || this.lastChatId !== nextProps.updateId;
    // }

    render() {
        const {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const font = App.profile.userConfig.chatFontSize;
        this.lastChatUpdateId = chat.updateId;

        return (<div
            {...other}
            className={HTML.classes('app-chat-messages white', className)}
        >
            <MessageList font={font} className="dock scroll-y user-selectable" messages={chat.messages} />
        </div>);
    }
}

export default ChatMessages;
