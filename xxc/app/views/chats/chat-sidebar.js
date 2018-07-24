import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import {Tabs, TabPane} from '../../components/tabs';
import Lang from '../../lang';
import App from '../../core';
import {ChatSidebarPeoples} from './chat-sidebar-peoples';
import {ChatSidebarFiles} from './chat-sidebar-files';
import {ChatSidebarProfile} from './chat-sidebar-profile';
import replaceViews from '../replace-views';

class ChatSidebar extends Component {
    static propTypes = {
        className: PropTypes.string,
        chat: PropTypes.object,
        children: PropTypes.any,
        closeButton: PropTypes.bool,
    };

    static defaultProps = {
        className: null,
        chat: null,
        children: null,
        closeButton: true,
    };

    static get ChatSidebar() {
        return replaceViews('chats/chat-sidebar', ChatSidebar);
    }

    shouldComponentUpdate(nextProps) {
        return this.props.className !== nextProps.className || this.props.children !== nextProps.children || this.props.closeButton !== nextProps.closeButton || this.props.chat !== nextProps.chat || this.lastChatId !== nextProps.updateId || (nextProps.chat.isOne2One && nextProps.chat.getTheOtherOne(App).updateId !== this.lastOtherOneUpdateId);
    }

    handleCloseBtnClick = () => {
        App.profile.userConfig.setChatSidebarHidden(this.props.chat.gid, true);
    };

    render() {
        const {
            chat,
            closeButton,
            className,
            children,
            ...other
        } = this.props;

        this.lastChatId = chat.updateId;
        if (chat.isOne2One) {
            this.lastOtherOneUpdateId = chat.getTheOtherOne(App).updateId;
        }

        return (<div
            {...other}
            className={HTML.classes('app-chat-sidebar dock', className)}
        >
            {closeButton !== false && <div className="dock-right dock-top has-padding app-chat-sidebar-close hint--bottom-left dock" data-hint={Lang.string('chat.sidebar.close')}>
                <button className="iconbutton btn rounded" type="button" onClick={this.handleCloseBtnClick}><Icon name="close" /></button>
            </div>}
            <Tabs className="dock column single" defaultActivePaneKey={chat.isOne2One ? 'profile' : 'peoples'} navClassName="shadow-divider flex-none" contentClassName="flex-auto scroll-y">
                {chat.isOne2One ? <TabPane key="profile" label={Lang.string('chat.sidebar.tab.profile.label')}>
                    <ChatSidebarProfile chat={chat} />
                </TabPane> : <TabPane key="peoples" label={`${Lang.string('chat.sidebar.tab.peoples.label')}`}>
                    <ChatSidebarPeoples chat={chat} />
                </TabPane>}
                <TabPane key="files" label={`${Lang.string('chat.sidebar.tab.files.label')}`}>
                    <ChatSidebarFiles chat={chat} />
                </TabPane>
            </Tabs>
            {children}
        </div>);
    }
}

export default ChatSidebar;
