import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import App from '../../core';
import ContextMenu from '../../components/context-menu';
import {ChatListItem} from './chat-list-item';
import replaceViews from '../replace-views';

export default class MenuRecentList extends Component {
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

    static get MenuRecentList() {
        return replaceViews('chats/menu-recent-list', MenuRecentList);
    }

    handleItemContextMenu = (e) => {
        const chat = App.im.chats.get(e.currentTarget.attributes['data-gid'].value);
        const menuItems = App.im.ui.createChatContextMenuItems(chat, this.props.filter, '');
        ContextMenu.show({x: e.pageX, y: e.pageY}, menuItems);
        e.preventDefault();
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

        return (<div className={HTML.classes('app-chats-menu-list list scroll-y', className)} {...other}>
            {chatItemsView}
            {children}
        </div>);
    }
}
