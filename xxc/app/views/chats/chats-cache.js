import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import App from '../../core';
import {ChatView} from './chat-view';
import replaceViews from '../replace-views';

class ChatsCache extends Component {
    static propTypes = {
        className: PropTypes.string,
        chatId: PropTypes.any,
        children: PropTypes.any,
        filterType: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        chatId: null,
        children: null,
        filterType: false,
    };

    static get ChatsCache() {
        return replaceViews('chats/chat-caches', ChatsCache);
    }

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

export default ChatsCache;
