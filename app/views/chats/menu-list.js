import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import App from '../../core';
import ContextMenu from '../../components/context-menu';
import {ChatListItem} from './chat-list-item';
import {MenuContactList} from './menu-contact-list';
import {MenuGroupList} from './menu-group-list';
import {MenuSearchList} from './menu-search-list';
import replaceViews from '../replace-views';

const loadChats = (filter, search) => {
    let chats = null;
    switch (filter) {
    case 'contacts':
        chats = !search ? App.im.chats.getContactsChats() : App.im.chats.search(search, filter);
        break;
    case 'groups':
        chats = !search ? App.im.chats.getGroups() : App.im.chats.search(search, filter);
        break;
    default:
        chats = !search ? App.im.chats.getRecents() : App.im.chats.search(search);
    }
    return chats || [];
};

class MenuList extends Component {
    static propTypes = {
        className: PropTypes.string,
        search: PropTypes.string,
        filter: PropTypes.string,
        children: PropTypes.any,
        onRequestClearSearch: PropTypes.func,
    };

    static defaultProps = {
        className: null,
        search: null,
        filter: null,
        children: null,
        onRequestClearSearch: null,
    };

    static get MenuList() {
        return replaceViews('chats/menu-list', MenuList);
    }

    componentDidMount() {
        this.dataChangeHandler = App.events.onDataChange(data => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        App.events.off(this.dataChangeHandler);
    }

    handleItemContextMenu = (chat, e) => {
        const menuItems = App.im.ui.createChatContextMenuItems(chat, this.props.filter, this.props.filter === 'groups' ? 'category' : '');
        ContextMenu.show({x: e.pageX, y: e.pageY}, menuItems);
        e.preventDefault();
    };

    render() {
        const {
            search,
            filter,
            onRequestClearSearch,
            className,
            children,
            ...other
        } = this.props;

        if (search) {
            return <MenuSearchList className={className} search={search} onRequestClearSearch={onRequestClearSearch} {...other} />;
        } else if (filter === 'contacts') {
            return <MenuContactList className={className} filter={filter} {...other} />;
        } else if (filter === 'groups') {
            return <MenuGroupList className={className} filter={filter} {...other} />;
        }

        const chats = loadChats(filter, search);
        let hasActiveChatItem = false;
        const activeChat = App.im.ui.currentActiveChat;
        const chatItemsView = chats.map(chat => {
            if (activeChat && activeChat.gid === chat.gid) {
                hasActiveChatItem = true;
            }
            return <ChatListItem onContextMenu={this.handleItemContextMenu.bind(this, chat)} key={chat.gid} filterType={filter} chat={chat} className="item" />;
        });
        if (!hasActiveChatItem && activeChat) {
            chatItemsView.splice(0, 0, <ChatListItem onContextMenu={this.handleItemContextMenu.bind(this, activeChat)} key={activeChat.gid} filterType={filter} chat={activeChat} className="item" />);
        }

        return (<div className={HTML.classes('app-chats-menu-list list scroll-y', className)} {...other}>
            {chatItemsView}
            {children}
        </div>);
    }
}

export default MenuList;
