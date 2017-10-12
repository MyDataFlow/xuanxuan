import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import ChatListItem from './chat-list-item';
import ChatHistory from './chat-history';
import SearchControl from '../../components/search-control';
import SelectBox from '../../components/select-box';

class ChatsHistory extends Component {

    constructor(props) {
        super(props);

        const chat = props.chat;
        this.chats = [
            {name: 'contacts', chats: App.im.chats.getContactsChats()},
            {name: 'groups', chats: App.im.chats.getGroups()}
        ];
        this.state = {
            isFetching: false,
            choosed: chat,
            search: '',
            searchFilterType: '',
            searchFilterTime: 'oneMonth',
            searching: false,
            searchTip: '',
            expanded: chat ? {contacts: chat.isOne2One, groups: chat.isGroupOrSystem} : {contacts: true, groups: false},
            chats: this.chats
        };
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
            const message = `${Lang.string('chats.history.fetchingMessages')} ${Math.floor(pager.percent)}%`;
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

    handleSearchChange = search => {
        this.setState({search, searchTip: this.searchControl.isEmpty() ? '' : Lang.string('chats.history.search.pressEnterToSearchTip')});
    }

    startSearch() {
        if(!this.searchControl.isEmpty()) {
            const search = this.searchControl.getValue();
            if(this.lastSearch !== search) {
                this.lastSearch = search;
                if(this.searchTask) {
                    this.searchTask.cancel();
                    this.searchTask = null;
                }
                const searchFilterType = this.state.searchFilterType;
                const chats = searchFilterType === 'contacts' ? this.chats[0].chats : (searchFilterType === 'groups' ? this.chats[1].chats : []);
                if(!searchFilterType) {
                    chats.push(...this.chats[0].chats);
                    chats.push(...this.chats[1].chats);
                }
                this.searchTask = App.im.chats.createCountMessagesTask(chats, search, this.state.searchFilterTime);
                this.setState({searchResult: {}});
                this.searchTask.onTask = result => {
                    let {searchResult} = this.state;
                    console.log('task', result);
                };
                this.searchTask.run();

            }
        }
    }

    handleSearchKeyDown = e => {
        if(e.which === 13) { // Enter
            this.startSearch();
        }
        console.log('keydonw', Object.assign({}, e));
    }

    render() {
        let {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const searchTimeOptions = [
            {label: Lang.string('time.oneWeek'), value: 'oneWeek'},
            {label: Lang.string('time.oneMonth'), value: 'oneMonth'},
            {label: Lang.string('time.threeMonth'), value: 'threeMonth'},
            {label: Lang.string('time.halfYear'), value: 'halfYear'},
            {label: Lang.string('time.oneYear'), value: 'oneYear'},
            {label: Lang.string('time.all'), value: ''},
        ];
        const searchTypeOptions = [
            {label: Lang.string('chats.history.search.type.all'), value: ''},
            {label: Lang.string('chats.history.search.type.contacts'), value: 'contacts'},
            {label: Lang.string('chats.history.search.type.groups'), value: 'groups'},
        ];

        return <div {...other}
            className={HTML.classes('app-chats-history dock column single', className)}
        >
            <div className="app-chats-history-header heading flex-none row single">
                <div className="flex-none title">{Lang.string('chats.history.title')}</div>
                <div className="flex-auto search-control row flex-middle">
                    <SearchControl
                        ref={e => this.searchControl = e}
                        onSearchChange={this.handleSearchChange}
                        placeholder={Lang.string('chats.history.search.placeholder')}
                        onKeyDown={this.handleSearchKeyDown}
                    >
                        <SelectBox value={this.state.searchFilterTime} onChange={value => this.setState({searchFilterTime: value})} options={searchTimeOptions} className="search-box-time dock dock-right small"/>
                        <SelectBox value={this.state.searchFilterType} onChange={value => this.setState({searchFilterType: value})} options={searchTypeOptions} className="search-box-type dock dock-right small"/>
                    </SearchControl>
                    <div className="small muted search-control-tip has-padding">{this.state.searchTip}</div>
                </div>
                <nav style={{overflow: 'visible'}} className="flex-none nav hint--bottom" data-hint={Lang.string('chats.history.fetchAllFromServer')}>
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
                    this.state.chats.map(group => {
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
