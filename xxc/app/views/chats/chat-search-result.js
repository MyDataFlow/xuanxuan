import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import {MessageList} from './message-list';
import {MessageListItem} from './message-list-item';
import replaceViews from '../replace-views';

const MANY_RESULT_COUNT = 200;
const MAX_RESULT_COUNT = 500;

class ChatSearchResult extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.any,
        chat: PropTypes.object,
        searchKeys: PropTypes.string,
        searchCount: PropTypes.number,
        searchFilterTime: PropTypes.any,
        requestGoto: PropTypes.func,
    };

    static defaultProps = {
        className: null,
        children: null,
        chat: null,
        searchKeys: null,
        requestGoto: null,
        searchCount: 0,
        searchFilterTime: 0,
    };

    static get ChatSearchResult() {
        return replaceViews('chats/chat-search-result', ChatSearchResult);
    }

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            errMessage: '',
            messages: [],
            realCount: null,
            selectedMessage: null
        };
    }

    componentDidMount() {
        this.loadMessages();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this._createSearchId(this.props) !== this.searchId) {
            this.loadMessages();
        }
        if (this.state.messages && this.state.messages.length && !this.state.selectedMessage) {
            this.handleMessageItemClick(this.state.messages[0]);
        }
    }

    _createSearchId(props) {
        const {searchKeys, searchFilterTime, chat} = props || this.props;
        return `${chat.gid}|${searchKeys}|${searchFilterTime}`;
    }

    loadMessages() {
        const {searchKeys, searchFilterTime, searchCount, chat} = this.props;
        const searchId = this._createSearchId(this.props);
        if (searchId !== this.searchId && searchCount) {
            this.searchId = searchId;
            this.contentConvertPattern = new RegExp(`(${searchKeys.split(' ').join('|')})(?![^<]*>)`, 'gi');
            this.setState({
                realCount: null,
                loading: true,
                errMessage: '',
                messages: [],
                selectedMessage: null
            });
            App.im.chats.searchChatMessages(chat, searchKeys, searchFilterTime).then(messages => {
                if (this.searchId === searchId) {
                    const realCount = messages.length;
                    if (realCount > MAX_RESULT_COUNT) {
                        messages.splice(MAX_RESULT_COUNT, realCount - MAX_RESULT_COUNT);
                    }
                    this.setState({
                        realCount,
                        loading: false,
                        errMessage: '',
                        messages,
                    });
                }
            }).catch(error => {
                if (this.searchId === searchId) {
                    this.setState({
                        realCount: 0,
                        loading: false,
                        errMessage: Lang.error(error),
                    });
                }
            });
        }
    }

    convertContent(content) {
        if (this.contentConvertPattern && this.contentConvertPattern.test(content)) {
            content = content.replace(this.contentConvertPattern, "<span class='highlight'>$1</span>");
        }
        return content;
    }

    handleMessageItemClick(message, e) {
        this.setState({selectedMessage: message});
        if (this.props.requestGoto) {
            this.props.requestGoto(message);
        }
        if (e) {
            e.stopPropagation();
        }
    }

    listItemCreator(message, lastMessage) {
        return (<MessageListItem
            className={HTML.classes('state state-click-throuth', {active: this.state.selectedMessage && this.state.selectedMessage.gid === message.gid})}
            staticUI
            hideHeader={false}
            showDateDivider={false}
            lastMessage={lastMessage}
            key={message.gid}
            message={message}
            avatarSize={20}
            dateFormater="yyyy-M-d hh:mm"
            textContentConverter={this.convertContent.bind(this)}
            onClick={this.handleMessageItemClick.bind(this, message)}
        />);
    }

    render() {
        const {
            chat,
            searchKeys,
            searchFilterTime,
            searchCount,
            className,
            children,
            requestGoto,
            ...other
        } = this.props;

        if (!searchCount) {
            return (<div
                {...other}
                className={HTML.classes('app-chat-search-result column single', className)}
            />);
        }

        return (<div
            {...other}
            className={HTML.classes('app-chat-search-result column single', className)}
            onClick={this.handleMessageItemClick.bind(this, null)}
        >
            <header className="heading flex-none gray">
                <div className="title"><small>{Lang.format('chats.chat.search.result.format', chat.getDisplayName(App), (typeof this.state.realCount) !== 'number' ? searchCount : this.state.realCount)}</small></div>
                {this.state.loading ? <Icon className="loading spin muted" /> : null}
            </header>
            <div className="flex-auto user-selectable scroll-y scroll-x fluid">
                <MessageList
                    className="app-message-list-simple"
                    staticUI
                    messages={this.state.messages}
                    stayBottom={false}
                    listItemCreator={this.listItemCreator.bind(this)}
                />
            </div>
            {!this.state.selectedMessage && <div className="flex-none heading info-pale">
                <Avatar icon="information-outline" />
                <div className="title"><small>{Lang.string('chats.history.search.result.selectTip')}</small></div>
            </div>}
            {this.state.realCount > MANY_RESULT_COUNT && <div className="flex-none heading info-pale">
                <Avatar icon="information-outline" />
                <div className="title"><small>{this.state.realCount > MAX_RESULT_COUNT ? Lang.format('chats.history.search.result.notShow.format', this.state.realCount - MAX_RESULT_COUNT) : ''}{Lang.string('chats.history.search.result.toMany')}</small></div>
            </div>}
            {children}
        </div>);
    }
}

export default ChatSearchResult;
