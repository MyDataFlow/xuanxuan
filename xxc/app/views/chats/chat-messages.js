import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import {MessageList} from './message-list';
import replaceViews from '../replace-views';
import Spinner from '../../components/spinner';
import Lang from '../../lang';

class ChatMessages extends Component {
    static get ChatMessages() {
        return replaceViews('chats/chat-messages', ChatMessages);
    }

    static propTypes = {
        className: PropTypes.string,
        chat: PropTypes.object,
    };

    static defaultProps = {
        className: null,
        chat: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: !props.chat.isLoadingOver
        };
    }

    componentDidMount() {
        this.loadChatMessages(400);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.loading !== this.state.loading || this.props.className !== nextProps.className || this.props.chat !== nextProps.chat || this.lastChatUpdateId !== nextProps.updateId;
    }

    componentDidUpdate() {
        if (!this.props.chat.isFirstLoaded) {
            this.loadChatMessages();
        }
    }

    componentWillUnmount() {
        if (this.loadChatMessagesTask) {
            clearTimeout(this.loadChatMessagesTask);
        }
    }

    loadChatMessages(delay = 0) {
        const {chat} = this.props;
        if (!chat.isLoadingOver && !this.loadChatMessagesTask) {
            this.loadChatMessagesTask = setTimeout(() => {
                this.setState({loading: true}, () => {
                    App.im.chats.loadChatMessages(chat).then(() => {
                        return this.setState({loading: false});
                    });
                    this.loadChatMessagesTask = null;
                });
            }, delay);
        }
    }

    handleScroll = scrollInfo => {
        if (scrollInfo.isAtTop) {
            this.loadChatMessages();
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

        let headerView = null;
        if (this.state.loading) {
            headerView = <Spinner className="has-padding" />;
        } else if (chat.messages && chat.isLoadingOver) {
            headerView = <div className="has-padding small muted text-center space-sm">― {Lang.string('chat.noMoreMessage')} ―</div>;
        } else {
            headerView = <a className="has-padding small muted text-center block space-sm" onClick={this.loadChatMessages.bind(this, 0)}>― {Lang.string('chat.loadMoreMessage')} ―</a>;
        }

        return (<div
            className={classes('app-chat-messages white', className)}
            {...other}
        >
            <MessageList header={headerView} font={font} className="dock scroll-y user-selectable" messages={chat.messages} onScroll={chat.isLoadingOver ? null : this.handleScroll} />
        </div>);
    }
}

export default ChatMessages;
