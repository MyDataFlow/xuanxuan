import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import ChatTitle from './chat-title';
import MessageList from './message-list';
import Pager from '../../components/pager';

class ChatHistory extends Component {

    constructor(props) {
        super(props);

        const chat = props.chat;
        this.state = {
            pager: {
                page: 1,
                recTotal: 0,
                recPerPage: 50,
                pageRecCount: 0
            },
            message: '',
            loading: true,
            messages: []
        };
    }

    loadMessages(callback) {
        this.setState({loading: true});
        const {pager} = this.state;
        const {chat} = this.props;
        App.im.chats.loadChatMessages(chat, null, pager.recPerPage, pager.recPerPage * (pager.page - 1), false).then(messages => {
            pager.pageRecCount = messages.length;
            this.setState({pager, loading: false, messages});
            callback && callback(messages);
        }).catch(error => {
            this.setState({pager, loading: false, messages: [], message: error && Lang.error(error)});
            callback && callback(false);
        });
    }

    findMessages(callback) {
        this.setState({loading: true});
        const {pager} = this.state;
        const {chat} = this.props;
        App.im.chats.countChatMessages(chat.gid).then(count => {
            if(count) {
                pager.page = Math.ceil(count / pager.recPerPage);
                pager.recTotal = count;
                this.setState({pager});
                this.loadMessages(callback);
            } else {
                this.setState({loading: false, messages: [], message: Lang.string('chats.history.noMessages')});
                callback && callback(false);
            }
        }).catch(error => {
            this.setState({loading: false, messages: [], message: error && Lang.error(error)});
            callback && callback(false);
        });

    }

    handleOnPageChange = (page) => {
        if(!this.state.loading) {
            const {pager} = this.state;
            pager.page = page;
            this.setState({pager});
            this.loadMessages();
        }
    }

    handleFecthBtnClick = e => {
        const chat = this.props.chat;
        if(chat.id) {
            this.setState({loading: true, message: Lang.string('chats.history.fetchingMessages')});
            App.im.server.fetchChatHistory(this.props.chat.gid);
        } else {
            this.setState({loading: false, message: Lang.string('chats.history.localChat'), messages: []});
        }
    }

    componentWillUnmount() {
        App.events.off(this.chatHistoryHandler);
        clearTimeout(this.fetchOverTaskTimer);
    }

    componentDidMount() {
        this.chatHistoryHandler = App.im.server.onChatHistory((messages, pager) => {
            this.setState({message: `${Lang.string('chats.history.fetchingMessages')} ${Math.min(pager.recTotal, pager.pageID*pager.recPerPage)}/${pager.recTotal}`});
            if(pager.isFetchOver) {
                const thisPager = this.state.pager;
                thisPager.recTotal = pager.recTotal;
                thisPager.page = Math.ceil(thisPager.recTotal / thisPager.recPerPage);
                this.setState({pager: thisPager, message: `${Lang.string('chats.history.fetchingMessages')} ${Lang.string('chats.history.fetchFinish')}`});
                this.fetchOverTaskTimer = setTimeout(() => {
                    this.loadMessages();
                    this.setState({message: ''});
                }, 200);
            }
        });
        this.loadFirstPage();
    }

    loadFirstPage() {
        this.setState({
            pager: {
                page: 1,
                recTotal: 0,
                recPerPage: 50,
                pageRecCount: 0
            },
            message: '',
            loading: true,
            messages: []
        });
        this.findMessages(messages => {
            if(!messages || !messages.length) {
                this.handleFecthBtnClick();
            }
        });
    }

    componentDidUpdate(nextProps, nextState) {
        if(nextProps.chat.gid !== this.props.chat.gid) {
            this.loadFirstPage();
        }
    }

    render() {
        let {
            chat,
            className,
            children,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-chat-history column single scroll-x', className)}
        >
            <ChatTitle className="flex-none gray has-padding-h" chat={chat}>
                <nav className="toolbar flex flex-middle">
                    <Pager {...this.state.pager} onPageChange={this.handleOnPageChange}/>
                    <div data-hint={Lang.string('chats.history.fetchFromServer')} className="hint--bottom-left"><button onClick={this.handleFecthBtnClick} type="button" disabled={this.state.loading} className="iconbutton btn rounded"><Icon name="cloud-download icon-2x"/></button></div>
                </nav>
            </ChatTitle>
            {this.state.message && <div className="heading blue flex-none">
                <Avatar icon={this.state.loading ? 'loading spin' : 'information'}/>
                <div className="title">{this.state.message}</div>
            </div>}
            <div className="flex-auto scroll-y scroll-x fluid">
                <MessageList messages={this.state.messages}/>
            </div>
            {children}
        </div>;
    }
}

export default ChatHistory;
