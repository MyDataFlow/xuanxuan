import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import App from '../../core';
import {MessageList} from './message-list';
import replaceViews from '../replace-views';

class ChatMessages extends Component {
    static propTypes = {
        className: PropTypes.string,
        chat: PropTypes.object,
    };

    static defaultProps = {
        className: null,
        chat: null,
    };

    static get ChatMessages() {
        return replaceViews('chats/chat-messages', ChatMessages);
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: !props.chat.localMessagesLoaded
        };
    }

    componentDidMount() {
        this.loadChatMessages();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.loading !== this.state.loading || this.props.className !== nextProps.className || this.props.chat !== nextProps.chat || this.lastChatUpdateId !== nextProps.updateId;
    }

    componentDidUpdate() {
        this.loadChatMessages();
    }

    componentWillUnmount() {
        if (this.loadChatMessagesTask) {
            clearTimeout(this.loadChatMessagesTask);
        }
    }

    loadChatMessages() {
        const {chat} = this.props;
        if (!chat.localMessagesLoaded && !this.loadChatMessagesTask) {
            this.loadChatMessagesTask = setTimeout(() => {
                App.im.chats.loadChatMessages(chat).then(() => {
                    this.setState({loading: false});
                });
                this.loadChatMessagesTask = null;
            }, 400);
        }
    }

    render() {
        const {
            chat,
            className,
            ...other
        } = this.props;

        const font = App.profile.userConfig.chatFontSize;
        this.lastChatUpdateId = chat.updateId;

        return (<div
            {...other}
            className={HTML.classes('app-chat-messages white load-indicator', className, {loading: this.state.loading})}
        >
            <MessageList font={font} className="dock scroll-y user-selectable" messages={chat.messages} />
        </div>);
    }
}

export default ChatMessages;
