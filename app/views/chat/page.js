import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import Menu                from './menu';
import NewChatWindow       from './newchat';
import ContactsWindow      from '../contacts/contacts';
import ChatWindow          from './chat';
import CacheContents       from '../mixins/cache-contents';
import Member              from '../../models/member';
import R                   from '../../resource';

/**
 * Chat page react component class
 */
const Page = React.createClass({
    mixins: [CacheContents],
    
    getInitialState() {
        return {
            chatGid: App.user.getConfig('ui.chat.activeChat')
        };
    },

    _handleChatMenuItemClick(chatGid) {
        this.setState({chatGid});
    },

    componentDidMount() {
        this._handleDataDeleteEvent = App.on(R.event.data_delete, data => {
            if(data.chats) {
                data.chats.forEach(chat => {
                    this.removeCacheContent(chat.gid);
                });
                App.emit(R.event.ui_change, {
                    activeChat: App.chat.lastActiveChatWindow
                });
                this.forceUpdate();
            }
        });

        this._handleUserSwapEvent = App.on(R.event.user_swap, data => {
            this.clearCache();
            this.setState({chatGid: null});
        });
    },

    componentWillUnmount() {
        App.off(this._handleDataDeleteEvent, this._handleUserSwapEvent);
    },

    getDisplayCacheContentId(cacheName) {
        return this.state.chatGid;
    },

    componentDidUpdate() {
        const {chatGid} = this.state;
        let chat = App.chat.dao.getChat(chatGid);
        if(chat) {
            if(chat.noticeCount) {
                chat.noticeCount = 0;
                App.emit(R.event.chats_notice, {muteChats: [chat]});
            }
            App.chat.activeChatWindow = chatGid;
            App.user.setConfig('ui.chat.activeChat', chatGid);
        }
    },

    renderCacheContent(contentId, cacheName) {
        if(contentId) {
            return <ChatWindow chatGid={contentId} className="dock-full" style={{left: App.user.getConfig('ui.chat.menu.width', 200)}}/>
        }
    },

    render() {
        return <div {...this.props}>
            <Menu onChatItemClick={this._handleChatMenuItemClick}/>
            {this.renderCacheContents()}
        </div>
    }
});

export default Page;
