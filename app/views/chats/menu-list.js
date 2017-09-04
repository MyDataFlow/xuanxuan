import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import ChatListItem from './chat-list-item';

class MenuList extends Component {

    loadChats(filter, search) {
        let chats = null;
        switch(filter) {
            case 'contacts':
                chats = !search ? App.im.chats.getContactsChats() : App.im.chats.search(search, filter);
                break;
            case 'groups':
                chats = !search ? App.im.chats.getGroups() : App.im.chats.search(search, filter);
                break;
            default:
                chats = search ? App.im.chats.search(search) : App.im.chats.getRecents();
        }
        return chats || [];
    }

    componentDidMount() {
        this.dataChangeHandler = App.events.onDataChange(data => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        App.events.off(this.dataChangeHandler);
    }

    render() {
        let {
            search,
            filter,
            className,
            style,
            children,
            ...other
        } = this.props;

        const chats = this.loadChats(filter, search);

        return <div className={HTML.classes('app-chats-menu-list list scroll-y scrollbar-thin scrollbar-hover', className)} style={style} {...other}>
            {
                chats.map(chat => {
                    return <ChatListItem key={chat.gid} filterType={filter} chat={chat} className="item"/>;
                })
            }
            {children}
        </div>;
    }
}

export default MenuList;
