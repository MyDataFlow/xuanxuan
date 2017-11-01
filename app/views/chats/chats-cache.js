import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import App from '../../core';
import ChatView from './chat';

class ChatsCacheView extends Component {
    static propTypes = {
        className: PropTypes.string,
        chatId: PropTypes.string,
        children: PropTypes.any,
        filterType: PropTypes.string,
    };

    static defaultProps = {
        className: null,
        chatId: null,
        children: null,
        filterType: false,
    };

    render() {
        const {
            chatId,
            filterType,
            className,
            children,
            ...other
        } = this.props;

        return (<div
            {...other}
            className={HTML.classes('app-chats-cache', className)}
        >
            {
                App.im.ui.activeAndMapCacheChats(chatId, cgid => {
                    if (cgid) {
                        return <ChatView key={cgid} chatGid={cgid} hidden={!App.im.ui.isActiveChat(cgid)} />;
                    }
                    if (DEBUG) {
                        console.warn('Cannot render undefined chat cache.');
                    }
                    return null;
                })
            }
            {children}
        </div>);
    }
}

export default ChatsCacheView;
