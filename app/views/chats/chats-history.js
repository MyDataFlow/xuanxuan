import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import ChatListItem from './chat-list-item';
import ChatHistory from './chat-history';

class ChatsHistory extends Component {

    constructor(props) {
        super(props);

        const chat = props.chat;
        this.state = {
            choosed: chat,
            expanded: chat ? {contacts: chat.isOne2One, groups: chat.isGroupOrSystem} : {contacts: true, groups: false},
        };
        this.chats = [
            {name: 'contacts', chats: App.im.chats.getContactsChats()},
            {name: 'groups', chats: App.im.chats.getGroups()}
        ];
    }

    handleGroupHeaderClick(name) {
        const {expanded} = this.state;
        expanded[name] = !expanded[name];
        this.setState({expanded});
    }

    handleChatItemClick(chat) {
        this.setState({choosed: chat});
    }

    render() {
        let {
            chat,
            className,
            children,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-chats-history dock row single', className)}
        >
            <div className="app-chats-history-menu primary-pale scroll-y flex-none">
            {
                this.chats.map(group => {
                    const isExpanded = this.state.expanded[group.name];
                    return <div key={group.name} className="app-chats-history-menu-group">
                        <a className="heading" onClick={this.handleGroupHeaderClick.bind(this, group.name)}>
                            <Avatar className="text-primary" icon={isExpanded ? 'menu-down' : 'menu-right'}/>
                            <div className="text-primary">{Lang.string(`chats.history.group.${group.name}`)} ({group.chats.length})</div>
                        </a>
                        {isExpanded && <div className="app-chats-history-menu-list list compact">
                        {
                            group.chats.map(chat => {
                                const isChoosed = this.state.choosed && this.state.choosed.gid === chat.gid;
                                return <ChatListItem key={chat.gid} notUserLink="disabled" className={isChoosed ? 'item white text-primary' : 'item'} onClick={this.handleChatItemClick.bind(this, chat)} chat={chat}/>
                            })
                        }
                        </div>}
                    </div>
                })
            }
            </div>
            {
                this.state.choosed ? <ChatHistory className="flex-auto white" chat={this.state.choosed}/> : <div className="flex-auto center-content muted"><div>{Lang.string('chats.history.selectChatTip')}</div></div>
            }
            {children}
        </div>;
    }
}

export default ChatsHistory;
