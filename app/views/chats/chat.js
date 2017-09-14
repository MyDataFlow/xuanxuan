import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import SplitPane from 'react-split-pane';
import Config from 'Config';
import ChatHeader from './chat-header';
import ChatMessages from './chat-messages';
import ChatSendbox from './chat-sendbox';
import ChatSidebar from './chat-sidebar';

class ChatView extends Component {

    componentDidMount() {
        this.dataChangeHandler = App.events.onDataChange(data => {
            if(data.chats && data.chats[this.props.chat.gid]) {
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
        let {
            chat,
            hidden,
            className,
            style,
            children,
            ...other
        } = this.props;

        if(chat['delete']) {
            return <div key={chat.gid} className="box muted">请选择一个聊天会话。</div>
        }

        const hideSidebar = App.profile.userConfig.isChatSidebarHidden(chat.gid);
        const isReadOnly = !chat.isCommitter(App.profile.user);

        return <div {...other}
            className={HTML.classes('app-chat dock', className, {hidden})}
        >
            <SplitPane className={hideSidebar ? 'soloPane1' : ''} split="vertical" primary="second" maxSize={360} minSize={150} defaultSize={200}>
                {
                    isReadOnly ? <div className="column single dock">
                        <ChatHeader chat={chat} className="flex-none"/>
                        <ChatMessages chat={chat} className="flex-auto relative"/>
                        <div className="flex-none gray text-gray heading"><Avatar icon="lock-outline"/><div className="title">{Lang.string('chat.committers.blockedTip')}</div></div>
                    </div> :
                    <SplitPane split="horizontal" primary="second" maxSize={500} minSize={80} defaultSize={100}>
                        <div className="column single dock">
                            <ChatHeader chat={chat} className="flex-none"/>
                            <ChatMessages chat={chat} className="flex-auto relative"/>
                        </div>
                        <ChatSendbox className="dock" chat={chat}/>
                    </SplitPane>
                }
                <ChatSidebar chat={chat}/>
            </SplitPane>
        </div>;
    }
}

export default ChatView;
