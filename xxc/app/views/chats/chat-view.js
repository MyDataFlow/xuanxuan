import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SplitPane from 'react-split-pane';
import {classes} from '../../utils/html-helper';
import DateHelper from '../../utils/date-helper';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import {ChatHeader} from './chat-header';
import {ChatMessages} from './chat-messages';
import {ChatSendbox} from './chat-sendbox';
import {ChatSidebar} from './chat-sidebar';
import replaceViews from '../replace-views';

class ChatView extends Component {
    static get ChatView() {
        return replaceViews('chats/chat-view', ChatView);
    }

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
            return <div key={chatGid} className={classes('box muted', {hidden})}>{Lang.string('chats.chat.selectOneOnMenu')}</div>;
        }

        const hideSidebar = App.profile.userConfig.isChatSidebarHidden(chat.gid, App.ui.isSmallScreen() || chat.isOne2One);
        const isReadOnly = chat.isReadonly(App.profile.user);
        const isRobot = chat.isRobot;

        let chatView = null;
        if (isReadOnly) {
            let blockTip = null;
            if (chat.isDeleteOne2One) {
                blockTip = Lang.string('chat.deletedOne2OneTip');
            } else if (chat.isDismissed) {
                blockTip = Lang.format('chat.group.dismissTip', DateHelper.formatDate(chat.visibleDate));
            } else {
                blockTip = Lang.string('chat.committers.blockedTip');
            }
            chatView = (<div className="column single dock">
                <ChatHeader chat={chat} className="flex-none" />
                <ChatMessages chat={chat} className="flex-auto relative" />
                {isRobot ? null : <div className="flex-none gray text-gray heading"><Avatar icon="lock-outline" /><div className="title">{blockTip}</div></div>}
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
            className={classes('app-chat dock', className, {hidden, 'chat-readonly': isReadOnly})}
        >
            {isRobot ? chatView : <SplitPane className={hideSidebar ? 'soloPane1' : ''} split="vertical" primary="second" maxSize={360} minSize={150} defaultSize={200} paneStyle={{userSelect: 'none'}}>
                {chatView}
                <ChatSidebar chat={chat} />
            </SplitPane>}
            {children}
        </div>);
    }
}

export default ChatView;
