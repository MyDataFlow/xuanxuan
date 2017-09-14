import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import {Tabs, TabPane} from '../../components/tabs';
import ChatSidebarPeoples from './chat-sidebar-peoples';
import ChatSidebarFiles from './chat-sidebar-files';

class ChatSidebar extends Component {

    handleCloseBtnClick = () => {
        App.profile.userConfig.setChatSidebarHidden(this.props.chat.gid, true);
    }

    render() {
        let {
            chat,
            closeButton,
            className,
            style,
            children,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-chat-sidebar dock')}
        >
            {closeButton !== false && <div className="dock-right dock-top has-padding app-chat-sidebar-close hint--bottom-left dock" data-hint={Lang.string('chat.sidebar.close')}>
              <button className="iconbutton btn rounded" type="button" onClick={this.handleCloseBtnClick}><Icon name="close"/></button>
            </div>}
            <Tabs className="dock column single" defaultActivePaneKey="peoples" navClassName="shadow-divider flex-none" contentClassName="flex-auto scroll-y">
                <TabPane key="peoples" label={`${Lang.string('chat.sidebar.tab.peoples.label')}(${chat.membersCount})`}>
                    <ChatSidebarPeoples chat={chat}/>
                </TabPane>
                <TabPane key="files" label={`${Lang.string('chat.sidebar.tab.files.label')}`}>
                    <ChatSidebarFiles chat={chat}/>
                </TabPane>
            </Tabs>
        </div>;
    }
}

export default ChatSidebar;
