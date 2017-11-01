import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import MessageList from './message-list';
import App from '../../core';

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

    render() {
        const {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const font = App.profile.userConfig.chatFontSize;

        return (<div
            {...other}
            className={HTML.classes('app-chat-messages white', className)}
        >
            <MessageList font={font} className="dock scroll-y user-selectable" messages={chat.messages} />
        </div>);
    }
}

export default ChatMessages;
