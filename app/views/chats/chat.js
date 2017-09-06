import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
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

    render() {
        let {
            chat,
            hidden,
            className,
            style,
            children,
            ...other
        } = this.props;

        console.info('Render chat', chat);

        return <div {...other}
            className={HTML.classes('app-chat', className, {hidden})}
        >
            <SplitPane split="vertical" primary="second" maxSize={360} minSize={100} defaultSize={200}>
                <SplitPane split="horizontal" primary="second" maxSize={500} minSize={80} defaultSize={100}>
                    <div>
                        <ChatHeader chat={chat} className="dock-top"/>
                        <ChatMessages chat={chat} className="dock-bottom"/>
                    </div>
                    <ChatSendbox className="dock" chat={chat}/>
                </SplitPane>
                <ChatSidebar chat={chat}/>
            </SplitPane>
        </div>;
    }
}

export default ChatView;
