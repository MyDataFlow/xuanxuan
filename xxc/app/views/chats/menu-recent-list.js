import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import {ChatListItem} from './chat-list-item';
import replaceViews from '../replace-views';
import {showContextMenu} from '../../core/context-menu';

export default class MenuRecentList extends Component {
    static get MenuRecentList() {
        return replaceViews('chats/menu-recent-list', MenuRecentList);
    }

    static propTypes = {
        className: PropTypes.string,
        filter: PropTypes.string,
        children: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        filter: null,
        children: null,
    };

    handleItemContextMenu = (event) => {
        const chat = App.im.chats.get(event.currentTarget.attributes['data-gid'].value);
        showContextMenu('chat.menu', {
            event,
            chat,
            menuType: this.props.filter,
            viewType: ''
        });
    };

    render() {
        const {
            filter,
            className,
            children,
            ...other
        } = this.props;

        const chats = App.im.chats.getRecents();
        let hasActiveChatItem = false;
        const activeChat = App.im.ui.currentActiveChat;
        const chatItemsView = chats.map(chat => {
            if (activeChat && activeChat.gid === chat.gid) {
                hasActiveChatItem = true;
            }
            return <ChatListItem onContextMenu={this.handleItemContextMenu} data-gid={chat.gid} key={chat.gid} filterType={filter} chat={chat} className="item" />;
        });
        if (!hasActiveChatItem && activeChat) {
            chatItemsView.splice(0, 0, <ChatListItem onContextMenu={this.handleItemContextMenu} data-gid={activeChat.gid} key={activeChat.gid} filterType={filter} chat={activeChat} className="item" />);
        }

        return (<div className={classes('app-chats-menu-list list scroll-y', className)} {...other}>
            {chatItemsView}
            {children}
        </div>);
    }
}
