import React, {Component, PropTypes} from 'react';
import SplitPane from 'react-split-pane';
import HTML from '../../utils/html-helper';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import ChatHeader from './chat-header';
import ChatMessages from './chat-messages';
import ChatSendbox from './chat-sendbox';
import ChatSidebar from './chat-sidebar';

class ChatView extends Component {
    static propTypes = {
        className: PropTypes.string,
        chatGid: PropTypes.string,
        children: PropTypes.any,
        hidden: PropTypes.bool,
    };

    static defaultProps = {
        className: null,
        chatGid: null,
        children: null,
        hidden: false,
    };

    componentDidMount() {
        const {chatGid} = this.props;
        this.dataChangeHandler = App.events.onDataChange(data => {
            if (
                (data.chats && data.chats[chatGid]) ||
                (data.members)
            ) {
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        App.events.off(this.dataChangeHandler);
    }

    // handleSplitPaneChange = size => {
    //     if(size < 150) {
    //         App.profile.userConfig.setChatSidebarHidden(this.props.chat.gid, true);
    //     }
    // }

    render() {
        const {
            chatGid,
            hidden,
            className,
            children,
            ...other
        } = this.props;

        const chat = App.im.chats.get(chatGid);

        if (!chat || chat.delete) {
            return <div key={chatGid} className={HTML.classes('box muted', {hidden})}>请在左侧选择一个聊天会话。</div>;
        }

        const hideSidebar = App.profile.userConfig.isChatSidebarHidden(chat.gid, chat.isOne2One);
        const isReadOnly = !chat.isCommitter(App.profile.user);

        let chatView = null;
        if (isReadOnly) {
            chatView = (<div className="column single dock">
                <ChatHeader chat={chat} className="flex-none" />
                <ChatMessages chat={chat} className="flex-auto relative" />
                <div className="flex-none gray text-gray heading"><Avatar icon="lock-outline" /><div className="title">{Lang.string('chat.committers.blockedTip')}</div></div>
            </div>);
        } else {
            chatView = (<SplitPane split="horizontal" primary="second" maxSize={500} minSize={80} defaultSize={100} paneStyle={{userSelect: 'none'}}>
                <div className="column single dock">
                    <ChatHeader chat={chat} className="flex-none" />
                    <ChatMessages chat={chat} className="flex-auto relative" />
                </div>
                <ChatSendbox className="dock" chat={chat} />
            </SplitPane>);
        }

        return (<div
            {...other}
            className={HTML.classes('app-chat dock', className, {hidden})}
        >
            <SplitPane className={hideSidebar ? 'soloPane1' : ''} split="vertical" primary="second" maxSize={360} minSize={150} defaultSize={200} paneStyle={{userSelect: 'none'}}>
                {chatView}
                <ChatSidebar chat={chat} />
            </SplitPane>
            {children}
        </div>);
    }
}

export default ChatView;
