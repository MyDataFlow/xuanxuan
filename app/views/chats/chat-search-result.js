import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import MessageList from './message-list';
import MessageListItem from './message-list-item';

const MANY_RESULT_COUNT = 100;
const MAX_RESULT_COUNT = 500;

class ChatHistory extends Component {

    constructor(props) {
        super(props);

        const chat = props.chat;
        this.state = {
            loading: false,
            errMessage: '',
            messages: [],
            realCount: null,
            selectedMessage: null
        };
    }

    _createSearchId(props) {
        const {searchKeys, searchFilterTime, chat} = props || this.props;
        return `${chat.gid}|${searchKeys}|${searchFilterTime}`;
    }

    loadMessages() {
        const {searchKeys, searchFilterTime, searchCount, chat} = this.props;
        const searchId = this._createSearchId(this.props);
        if(searchId !== this.searchId && searchCount) {
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
                if(this.searchId === searchId) {
                    const realCount = messages.length;
                    if(realCount > MAX_RESULT_COUNT) {
                        messages.splice(MAX_RESULT_COUNT, realCount - MAX_RESULT_COUNT);
                    }
                    this.setState({
                        realCount,
                        loading: false,
                        errMessage: '',
                        messages
                    });
                }
            }).catch(error => {
                if(this.searchId === searchId) {
                    this.setState({
                        realCount: 0,
                        loading: false,
                        errMessage: Lang.error(error),
                    });
                }
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(this._createSearchId(this.props) !== this.searchId) {
            this.loadMessages();
        }
    }

    componentDidMount() {
        this.loadMessages();
    }

    convertContent(content) {
        if (this.contentConvertPattern && this.contentConvertPattern.test(content)) {
            content = content.replace(this.contentConvertPattern, "<span class='highlight'>$1</span>");
        }
        return content;
    }

    handleMessageItemClick(message) {
        this.setState({selectedMessage: message});
    }

    listItemCreator(message, lastMessage) {
        return <MessageListItem
            className={HTML.classes('state', {active: this.state.selectedMessage && this.state.selectedMessage.gid === message.gid})}
            staticUI={true}
            hideHeader={false}
            showDateDivider={false}
            lastMessage={lastMessage}
            key={message.gid}
            message={message}
            avatarSize={20}
            dateFormater="yyyy-M-d hh:mm"
            textContentConverter={this.convertContent.bind(this)}
            onClick={this.handleMessageItemClick.bind(this, message)}
        />;
    }

    render() {
        let {
            chat,
            searchKeys,
            searchFilterTime,
            searchCount,
            className,
            children,
            ...other
        } = this.props;

        if(!searchCount) {
            return <div {...other}
                className={HTML.classes('app-chat-search-result column single', className)}
            ></div>;
        }

        return <div {...other}
            className={HTML.classes('app-chat-search-result column single', className)}
        >
            <header className="heading flex-none gray">
                <div className="title"><small>{Lang.format('chats.chat.search.result.format', chat.getDisplayName(App), (typeof this.state.realCount) !== 'number' ? searchCount : this.state.realCount)}</small></div>
                {this.state.loading ? <Icon className="loading spin muted"/> : null}
            </header>
            <div className="flex-auto user-selectable scroll-y scroll-x fluid">
                <MessageList
                    className="app-message-list-simple"
                    staticUI={true}
                    messages={this.state.messages}
                    stayBottom={false}
                    listItemCreator={this.listItemCreator.bind(this)}
                />
            </div>
            {this.state.realCount > MANY_RESULT_COUNT && <div className="flex-none heading info-pale">
                <Avatar icon="information-outline"/>
                <div className="title"><small>{this.state.realCount > MAX_RESULT_COUNT ? Lang.format('chats.history.search.result.notShow.format', this.state.realCount - MAX_RESULT_COUNT) : ''}{Lang.string('chats.history.search.result.toMany')}</small></div>
            </div>}
            {children}
        </div>;
    }
}

export default ChatHistory;
