import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import SearchControl from '../../components/search-control';
import MemberListItem from '../common/member-list-item';
import Messager from '../../components/messager';
import ROUTES from '../common/routes';
import ChatListItem from './chat-list-item';
import Spinner from '../../components/spinner';

class ChatCreateGroups extends Component {

    constructor(props) {
        super(props);

        this.state = {
            choosed: null,
            search: '',
            chats: [],
            loading: true
        };
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    loadPublicChats() {
        this.setState({loading: true});
        App.im.server.fetchPublicChats().then(chats => {
            if(this.unmounted) return;
            this.setState({loading: false, chats});
        }).catch(error => {
            if(this.unmounted) return;
            this.setState({loading: false, chats: []});
            if(error) {
                Messager.show(Lang.error(error), {type: 'danger'});
            }
        });
    }

    componentDidMount() {
        this.loadPublicChats();
    }

    handleSearchChange = search => {
        search = search && search.toLowerCase();
        this.setState({search});
    }

    handleRefreshBtnClick = () => {
        this.loadPublicChats();
    }

    handleJoinBtnClick = () => {
        const {choosed} = this.state;
        App.im.server.joinChat(choosed).then(chat => {
            window.location.hash = '#' + ROUTES.chats.groups.id(chat.gid);
            this.props.onRequestClose && this.props.onRequestClose();
        }).catch(error => {
            if(error) {
                Messager.show(Lang.error(error));
            }
        });
    }

    handleChatItemClick(chat) {
        this.setState({choosed: chat});
    }

    isMatchSearch(chat) {
        const {search} = this.state;
        if(!search.length) {
            return true;
        }
        const chatName = chat.name.toLowerCase();
        return chatName.includes(search) || chat.gid == search;
    }

    isChoosed(chat) {
        return this.state.choosed && this.state.choosed.gid === chat.gid;
    }

    render() {
        let {
            className,
            children,
            onRequestClose,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-chat-join-public column single', className)}
        >
            <div className="list-item divider flex-none">
                <Avatar icon="arrow-right" iconClassName="text-muted icon-2x"/>
                <div className="title strong">{Lang.string('chat.create.joinGroupTip')}</div>
                <div className="flex-none">
                    <button type="button" onClick={this.handleJoinBtnClick} disabled={!this.state.choosed} className="btn primary rounded">{this.state.choosed ? Lang.format('chat.create.joinGroup.format', this.state.choosed.getDisplayName(App)) : Lang.string('chat.create.join')}</button>
                </div>
            </div>
            <div className="white cell">
                <div className="column single">
                    <div className="cell heading flex-none has-padding">
                        <nav className="flex-auto">
                            <a className={"btn text-primary rounded" + (this.state.loading ? ' disabled' : '')} onClick={this.handleRefreshBtnClick}>{Lang.string('common.refresh')}</a>
                        </nav>
                        <SearchControl defaultValue={this.state.search} onSearchChange={this.handleSearchChange} className="flex-none" style={{width: HTML.rem(200)}}/>
                    </div>
                    <div className="cell scroll-y has-padding relative">
                        <div className="list fluid compact app-chat-join-public-chat-list">
                        {
                            !this.state.loading && this.state.chats.map(chat => {
                                if(!App.im.chats.get(chat.gid) && this.isMatchSearch(chat)) {
                                    const isChoosed = this.isChoosed(chat);
                                    return <ChatListItem notUserLink={true} className={isChoosed ? 'item primary-pale space-sm' : 'item space-sm'} onClick={this.handleChatItemClick.bind(this, chat)} key={chat.gid} chat={chat}>{isChoosed && <Icon name="check text-success"/>}</ChatListItem>;
                                }
                                return null;
                            })
                        }
                        {this.state.loading && <div className="dock center-content"><Spinner className="text-primary" iconSize={36}/></div>}
                    </div>
                    </div>
                </div>
            </div>
            {children}
        </div>;
    }
}

export default ChatCreateGroups;
