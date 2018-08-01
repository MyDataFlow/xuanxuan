import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import DateHelper from '../../utils/date-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Pager from '../../components/pager';
import Lang from '../../lang';
import App from '../../core';
import ChatMessage from '../../core/models/chat-message';
import {ChatTitle} from './chat-title';
import {MessageList} from './message-list';
import {MessageListItem} from './message-list-item';
import replaceViews from '../replace-views';

class ChatHistory extends Component {
    static propTypes = {
        chat: PropTypes.object,
        className: PropTypes.string,
        children: PropTypes.any,
        gotoMessage: PropTypes.object,
        searchKeys: PropTypes.string,
    };

    static get ChatHistory() {
        return replaceViews('chats/chat-history', ChatHistory);
    }

    static defaultProps = {
        chat: null,
        className: null,
        children: null,
        gotoMessage: null,
        searchKeys: null,
    };

    constructor(props) {
        super(props);

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
        this.pageMark = {};
    }

    componentDidMount() {
        this.chatHistoryHandler = App.im.server.onChatHistory((pager) => {
            if (pager.gid === this.props.chat.gid) {
                this.setState({message: `${Lang.string('chats.history.fetchingMessages')} ${Math.min(pager.recTotal, pager.pageID * pager.recPerPage)}/${pager.recTotal}`});
                if (pager.isFetchOver) {
                    const thisPager = this.state.pager;
                    thisPager.recTotal = pager.recTotal;
                    thisPager.page = Math.ceil(thisPager.recTotal / thisPager.recPerPage);
                    this.setState({pager: thisPager, message: `${Lang.string('chats.history.fetchingMessages')} ${Lang.string('chats.history.fetchFinish')}`});
                    this.fetchOverTaskTimer = setTimeout(() => {
                        this.loadMessages();
                        this.setState({message: ''});
                    }, 200);
                }
            }
        });
        this.loadFirstPage();
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextProps.searchKeys !== this.props.searchKeys) {
            if (nextProps.searchKeys) {
                this.contentConvertPattern = new RegExp(`(${nextProps.searchKeys.split(' ').join('|')})(?![^<]*>)`, 'gi');
            } else {
                this.contentConvertPattern = null;
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.chat.gid !== this.props.chat.gid) {
            this.loadFirstPage();
        } else if (this.props.gotoMessage) {
            const {gotoMessage} = this.props;
            if (gotoMessage) {
                const gotoId = `${gotoMessage.time}@${gotoMessage.gid}`;
                if (gotoId !== this.gotoId) {
                    this.loadMessages();
                }
            }
        }
        if (this.activeMessageId) {
            const activeMessageEle = document.getElementById(this.activeMessageId);
            if (activeMessageEle) {
                activeMessageEle.scrollIntoView({block: 'center', behavior: 'smooth'});
                activeMessageEle.classList.add('highlight-focus');
            }
            this.activeMessageId = null;
        }
    }

    componentWillUnmount() {
        App.events.off(this.chatHistoryHandler);
        clearTimeout(this.fetchOverTaskTimer);
    }


    findPageMark(chat, gotoMessage, pager) {
        const totalPage = Math.ceil(pager.recTotal / pager.recPerPage);
        if (totalPage < 2) {
            this.pageMark[gotoMessage.gid] = {page: pager.page};
            return Promise.resolve(pager);
        }
        return App.im.chats.getChatMessages(chat, msg => !!msg.id && msg.id <= gotoMessage.id, 0, 0, false, true, false, true).then(result => {
            pager.page = Math.ceil(result.count / pager.recPerPage);
            this.pageMark[gotoMessage.gid] = {page: pager.page};
            return Promise.resolve(pager);
        });
    }

    loadMessages(callback) {
        let {pager} = this.state;
        const {chat, gotoMessage} = this.props;
        this.setState({loading: true});

        if (gotoMessage) {
            const gotoId = `${gotoMessage.time}@${gotoMessage.gid}`;
            if (this.gotoId !== gotoId) {
                this.gotoId = gotoId;
                const mark = this.pageMark[gotoMessage.gid];
                if (mark) {
                    if (mark.page !== pager.page) {
                        pager.page = mark.page;
                        this.setState(pager);
                    }
                } else {
                    return this.findPageMark(chat, gotoMessage, pager).then((newPager) => {
                        pager = Object.assign(pager, newPager);
                        this.setState(pager);
                        this.loadMessages();
                    }).catch(error => {
                        this.setState({pager, loading: false, messages: [], message: error && Lang.error(error)});
                        if (callback) {
                            callback(false);
                        }
                    });
                }
            }
        }

        const pageDataID = `${chat.gid}/${pager.page}`;
        if (pageDataID === this.pageDataID) {
            this.setState({loading: false});
            if (callback) {
                callback(true);
            }
            return;
        }

        App.im.chats.getChatMessages(chat, msg => !!msg.id, pager.recPerPage, pager.recPerPage * (pager.page - 1), false).then(messages => {
            messages = ChatMessage.sort(messages);
            pager.pageRecCount = messages.length;
            this.setState({
                pager,
                loading: false,
                messages,
            });
            this.pageDataID = pageDataID;
            if (callback) {
                callback(messages);
            }
        }).catch(error => {
            this.setState({pager, loading: false, messages: [], message: error && Lang.error(error)});
            if (callback) {
                callback(false);
            }
        });
    }

    findMessages(callback) {
        this.setState({loading: true});
        const {pager} = this.state;
        const {chat} = this.props;
        App.im.chats.countChatMessages(chat.gid, msg => !!msg.id).then(count => {
            if (count) {
                pager.page = Math.ceil(count / pager.recPerPage);
                pager.recTotal = count;
                this.setState({pager});
                this.loadMessages(callback);
            } else {
                this.setState({loading: false, messages: [], message: Lang.string('chats.history.noMessages')});
                if (callback) {
                    callback(false);
                }
            }
        }).catch(error => {
            this.setState({loading: false, messages: [], message: error && Lang.error(error)});
            if (callback) {
                callback(false);
            }
        });
    }

    handleOnPageChange = (page) => {
        if (!this.state.loading) {
            const {pager} = this.state;
            pager.page = page;
            this.setState({pager});
            this.loadMessages();
        }
    }

    handleFecthBtnClick = e => {
        const chat = this.props.chat;
        if (chat.id) {
            this.setState({loading: true, message: Lang.string('chats.history.fetchingMessages')});
            App.im.server.fetchChatsHistory(this.props.chat.gid);
        } else {
            this.setState({loading: false, message: Lang.string('chats.history.localChat'), messages: []});
        }
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
            if (!messages || !messages.length) {
                this.handleFecthBtnClick();
            }
        });
    }

    convertContent = content => {
        if (this.props.searchKeys && this.contentConvertPattern && this.contentConvertPattern.test(content)) {
            content = content.replace(this.contentConvertPattern, "<span class='highlight'>$1</span>");
        }
        return content;
    }

    listItemCreator(message, lastMessage) {
        const active = this.props.searchKeys && this.props.gotoMessage && this.props.gotoMessage.gid === message.gid;
        if (active) {
            this.activeMessageId = `app-chat-history-message_${message.gid}`;
        }
        return (<MessageListItem
            id={active ? this.activeMessageId : null}
            className={HTML.classes({active})}
            staticUI
            lastMessage={lastMessage}
            key={message.gid}
            message={message}
            textContentConverter={this.convertContent}
        />);
    }

    render() {
        const {
            chat,
            className,
            children,
            gotoMessage,
            searchKeys,
            ...other
        } = this.props;

        const messages = this.state.messages;

        return (<div
            {...other}
            className={HTML.classes('app-chat-history column single', className)}
        >
            <ChatTitle className="flex-none gray has-padding-h" chat={chat}>
                {(messages && messages.length) ? <div className="small">{DateHelper.formatSpan(messages[0].date, messages[messages.length - 1].date, {full: Lang.string('time.format.full'), month: Lang.string('time.format.month'), day: Lang.string('time.format.day')})}</div> : null}
                <nav className="toolbar flex flex-middle">
                    <Pager {...this.state.pager} onPageChange={this.handleOnPageChange} />
                    <div data-hint={Lang.string('chats.history.fetchFromServer')} className="hint--bottom-left"><button onClick={this.handleFecthBtnClick} type="button" disabled={this.state.loading || !chat.id || App.im.server.isFetchingHistory()} className="iconbutton btn rounded"><Icon name="cloud-download icon-2x" /></button></div>
                </nav>
            </ChatTitle>
            {this.state.message && <div className="heading blue flex-none">
                <Avatar icon={this.state.loading ? 'loading spin' : 'information'} />
                <div className="title">{this.state.message}</div>
            </div>}
            <div className="flex-auto user-selectable scroll-y scroll-x fluid">
                <MessageList stayBottom={!gotoMessage} staticUI messages={messages} listItemCreator={this.listItemCreator.bind(this)} />
            </div>
            {children}
        </div>);
    }
}

export default ChatHistory;
