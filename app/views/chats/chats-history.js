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
            isFetching: false,
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

    handleFetchAllBtnClick = e => {
        App.im.server.fetchChatsHistory('all');
    }

    componentDidMount() {
        const updateFetchingMessage = (pager) => {
            const message = `${Lang.string('chats.history.fetchingMessages')} ${Math.floor(pager.percent)}% (${Math.min(pager.recTotal, pager.pageID*pager.recPerPage)}/${pager.recTotal} - ${pager.finish.length + 1}/${pager.total})`;
            this.setState({isFetching: true, message});
        };
        this.handleHistoryStart = App.im.server.onChatHistoryStart(updateFetchingMessage);
        this.handleHistoryEnd = App.im.server.onChatHistoryEnd(() => {
            this.setState({isFetching: false, message: ''});
        });
        this.handleHistory = App.im.server.onChatHistory(updateFetchingMessage);
    }

    componentWillUnmount() {
        App.events.off(this.handleHistoryStart, this.handleHistoryEnd, this.handleHistory);
    }

    render() {
        let {
            chat,
            className,
            children,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-chats-history dock column single', className)}
        >
            <div className="app-chats-history-header heading flex-none row single">
                <div className="flex-none title">{Lang.string('chats.history.title')}</div>
                <nav className="flex-none nav">
                {
                    this.state.isFetching ? <a>
                        <Icon name="sync spin"/> &nbsp; <small>{this.state.message}</small>
                    </a> : <a onClick={this.handleFetchAllBtnClick} className="text-primary"><Icon name="cloud-sync"/> &nbsp; <small>{Lang.string('chats.history.fetchAll')}</small></a>
                }
                </nav>
            </div>
            <div className="app-chats-history-content flex-auto row single">
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
            </div>
            {children}
        </div>;
    }
}

export default ChatsHistory;
