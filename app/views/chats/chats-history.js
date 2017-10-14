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
import ChatSearchResult from './chat-search-result';

class ChatsHistory extends Component {

    constructor(props) {
        super(props);

        const chat = props.chat;
        this.chats = [
            {name: 'contacts', chats: App.im.chats.getContactsChats()},
            {name: 'groups', chats: App.im.chats.getGroups()}
        ];
        this.searchFilterTime = 'oneMonth';
        this.searchFilterType = '';
        this.state = {
            isFetching: false,
            choosed: chat,
            search: '',
            searchFilterType: this.searchFilterType,
            searchFilterTime: this.searchFilterTime,
            searching: false,
            searchingChat: null,
            searchTip: '',
            searchResult: null,
            searchResultTotal: 0,
            searchProgress: 0,
            expanded: chat ? {contacts: chat.isOne2One, groups: chat.isGroupOrSystem} : {contacts: true, groups: false},
            chats: this.chats,
            messageGoto: null
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
        this.setState({search});
        this.startSearch();
    }

    handleSearchFilterTypeChange = searchFilterType => {
        this.setState({searchFilterType});
        this.searchFilterType = searchFilterType;
        this.startSearch();
    }

    handleSearchFilterTimeChange = searchFilterTime => {
        this.setState({searchFilterTime});
        this.searchFilterTime = searchFilterTime;
        this.startSearch();
    }

    handleRequestGoto = messageGoto => {
        this.setState({messageGoto: {
            time: new Date().getTime(),
            gid: messageGoto.gid,
            cgid: messageGoto.cgid,
            id: messageGoto.id,
            searchKeys: this.state.search
        }});
    }

    startSearch() {
        if(!this.searchControl.isEmpty()) {
            const search = this.searchControl.getValue();
            const {searchFilterType, searchFilterTime} = this;
            const searchId = [search, searchFilterTime, searchFilterType].join('|');
            if(this.lastSearchId !== searchId) {
                this.lastSearchId = searchId;
                if(this.searchTask) {
                    this.searchTask.cancel();
                }
                const chats = searchFilterType === 'contacts' ? this.chats[0].chats : (searchFilterType === 'groups' ? this.chats[1].chats : []);
                if(!searchFilterType) {
                    chats.push(...this.chats[0].chats);
                    chats.push(...this.chats[1].chats);
                }
                this.searchTask = App.im.chats.createCountMessagesTask(chats, search, searchFilterTime);
                this.setState({
                    searchResult: {},
                    searchResultTotal: 0,
                    searchTip: Lang.string('chats.history.searching'),
                    searching: true,
                    searchProgress: 0,
                    expanded: {
                        contacts: !searchFilterType || searchFilterType === 'contacts',
                        groups: !searchFilterType || searchFilterType === 'groups',
                    },
                });
                this.searchTask.onTask = (result, searchProgress) => {
                    let {searchResult, searchResultTotal} = this.state;
                    searchResult = Object.assign(searchResult || {}, {
                        [result.gid]: result.count
                    });
                    searchResultTotal += result.count;
                    this.setState({searchResult, searchResultTotal, searchProgress});
                };
                this.searchTask.onTaskStart = (task, searchProgress) => {
                    this.setState({
                        searchingChat: task.chat,
                        searchProgress,
                        searchTip: Lang.format('chats.history.searching.format', task.chat.getDisplayName(App))
                    });
                };
                this.searchTask.run().then(() => {
                    this.setState({
                        searchTip: Lang.format('chats.history.search.result.format', this.state.searchResultTotal),
                        searching: false,
                        searchProgress: 1,
                        searchingChat: null
                    });
                }).catch(error => {
                    if(error !== 'canceled') {
                        this.setState({
                            searchTip: Lang.error(error),
                            searching: false,
                            searchProgress: 1,
                            searchingChat: null,
                        });
                    }
                });
            }
        } else {
            this.lastSearchId = '';
            if(this.searchTask) {
                this.searchTask.cancel();
                this.searchTask = null;
            }
            this.setState({
                search: '',
                searchTip: '',
                searching: false,
                searchProgress: 0,
                searchResult: null,
                searchingChat: null
            });
        }
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
                        disabled={this.state.isFetching}
                        ref={e => this.searchControl = e}
                        changeDelay={500}
                        onSearchChange={this.handleSearchChange}
                        placeholder={Lang.string('chats.history.search.placeholder')}
                    >
                        <SelectBox value={this.state.searchFilterTime} onChange={this.handleSearchFilterTimeChange} options={searchTimeOptions} className="search-box-time dock dock-right small"/>
                        <SelectBox value={this.state.searchFilterType} onChange={this.handleSearchFilterTypeChange} options={searchTypeOptions} className="search-box-type dock dock-right small"/>
                    </SearchControl>
                    {this.state.isFetching ? null : <div className="search-control-tip">
                        <small className="muted">{this.state.searchTip}</small>
                        <div className="progress"><div className="bar" style={{width: `${this.state.searchProgress*100}%`}}></div></div>
                    </div>}
                </div>
                <nav style={{overflow: 'visible'}} className="flex-none nav hint--bottom" data-hint={Lang.string('chats.history.fetchAllFromServer')}>
                {
                    this.state.isFetching ? <a>
                        <Icon name="sync spin"/> &nbsp; <small>{this.state.message}</small>
                    </a> : <a onClick={this.handleFetchAllBtnClick} className={HTML.classes('text-primary', {disabled: this.state.searching})}><Icon name="cloud-sync"/> &nbsp; <small>{Lang.string('chats.history.fetchAll')}</small></a>
                }
                </nav>
            </div>
            <div className="app-chats-history-content flex-auto row single">
                <div className="app-chats-history-menu primary-pale scroll-y flex-none">
                {
                    this.state.chats.map(group => {
                        const {searchResult, searchFilterType} = this.state;
                        if(searchResult && searchFilterType && searchFilterType !== group.name) {
                            return null;
                        }
                        const isExpanded = this.state.expanded[group.name];
                        const chats = group.chats;
                        if(searchResult) {
                            chats.sort((chat1, chat2) => {
                                let result = (searchResult[chat2.gid] || 0) - (searchResult[chat1.gid] || 0);
                                if(result === 0) {
                                    result = chat2.id - chat1.id;
                                }
                                return result;
                            });
                        }
                        const itemsArray = [];
                        chats.forEach(chat => {
                            if(searchResult && searchResult[chat.gid] === 0) {
                                return null;
                            } else {
                                itemsArray.push(chat);
                            }
                        });
                        return <div key={group.name} className="app-chats-history-menu-group">
                            <a className="heading" onClick={this.handleGroupHeaderClick.bind(this, group.name)}>
                                <Avatar className="text-primary" icon={isExpanded ? 'menu-down' : 'menu-right'}/>
                                <div className="text-primary">{Lang.string(`chats.history.group.${group.name}`)} ({itemsArray.length})</div>
                            </a>
                            {isExpanded && <div className="app-chats-history-menu-list list compact">
                            {
                                itemsArray.map(chat => {
                                    const isChoosed = this.state.choosed && this.state.choosed.gid === chat.gid;
                                    let badge = null;
                                    if(searchResult) {
                                        if(searchResult[chat.gid] === 0 && !isChoosed) {
                                            return null;
                                        }
                                        if(this.state.searchingChat && this.state.searchingChat.gid === chat.gid) {
                                            badge = <Icon name="loading" square={true} className="spin-fast muted inline-block"/>;
                                        } else if(searchResult[chat.gid]) {
                                            badge = <div className="label circle info label-sm">{searchResult[chat.gid]}</div>;
                                        }
                                    }
                                    return <ChatListItem
                                        key={chat.gid}
                                        badge={badge}
                                        notUserLink="disabled"
                                        className={isChoosed ? 'item white text-primary' : 'item'}
                                        onClick={this.handleChatItemClick.bind(this, chat)}
                                        chat={chat}
                                    />
                                })
                            }
                            </div>}
                        </div>
                    })
                }
                </div>
                {
                    this.state.choosed ? <div className="row single flex-auto">
                        <ChatSearchResult
                            className={HTML.classes("flex-none", {empty: !this.state.searchResult || !this.state.searchResult[this.state.choosed.gid]})}
                            chat={this.state.choosed}
                            searchKeys={this.state.search}
                            searchFilterTime={this.state.searchFilterTime}
                            searchCount={this.state.searchResult && this.state.searchResult[this.state.choosed.gid]}
                            requestGoto={this.handleRequestGoto}
                        />
                        <ChatHistory gotoMessage={this.state.messageGoto && this.state.messageGoto.cgid === this.state.choosed.gid ? this.state.messageGoto : null} className="flex-auto white" chat={this.state.choosed}/>
                    </div> : <div className="flex-auto center-content muted"><div>{Lang.string('chats.history.selectChatTip')}</div></div>
                }
            </div>
            {children}
        </div>;
    }
}

export default ChatsHistory;
