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
            chatGid: App.user.config.ui.activeChat
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

    renderCacheContent(contentId, cacheName) {
        if(contentId) {
            App.chat.activeChatWindow = contentId;
            App.user.config.ui.activeChat = contentId;
            App.delaySaveUser();
            return <ChatWindow chatGid={contentId} className="dock-full" style={{left: App.user.config.ui.chat.menu.width}}/>
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
