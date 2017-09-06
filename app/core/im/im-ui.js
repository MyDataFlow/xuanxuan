import Events from '../events';
import profile from '../profile';
import chats from './im-chats';
import Lang from '../../lang';
import Server from './im-server';
import ChatMessage from '../models/chat-message';
import members from '../members';
import StringHelper from '../../utils/string-helper';

let activedChatId = null;
let activeCaches = {};

const EVENT = {
    activeChat: 'im.chats.activeChat'
};

const activeChat = chat => {
    if((typeof chat === 'string') && chat.length) {
        chat = chats.get(chat);
    }
    if(chat) {
        if(!activedChatId || chat.gid !== activedChatId) {
            activedChatId = chat.gid;
            Events.emit(EVENT.activeChat, chat);
        }
        activeCaches[chat.gid] = true;
    }
};

const isActiveChat = chatId => {
    return activedChatId === chatId;
};

const onActiveChat = listener => {
    return Events.on(EVENT.activeChat, listener);
};

const mapCacheChats = callback => {
    return Object.keys(activeCaches).map(gid => {
        return callback(chats.get(gid));
    });
};

const activeAndMapCacheChats = (chat, callback) => {
    activeChat(chat);
    return mapCacheChats(callback);
};

const createChatToolbarItems = (chat, showSidebarIcon) => {
    const items = [{
        id: 'star',
        icon: chat.star ? 'star text-red' : 'star-outline',
        label: Lang.string(chat.star ? 'chat.toolbor.unstar' : 'chat.toolbor.star'),
        click: () => {
            Server.toggleChatStar(chat);
        }
    }];
    if(chat.canInvite(profile.user)) {
        items.push({
            id: 'invite',
            icon: 'account-multiple-plus',
            label: Lang.string('chat.toolbor.invite')
        });
    }
    items.push({
        id: 'history',
        icon: 'history',
        label: Lang.string('chat.toolbor.history')
    });
    if(showSidebarIcon) {
        items.push({
            id: 'sidebar',
            icon: 'book-open',
            label: Lang.string('chat.toolbor.sidebar')
        });
    }
    if(chat.isGroupOrSystem) {
        items.push({
            id: 'more',
            icon: 'dots-horizontal',
            label: Lang.string('chat.toolbor.more')
        });
    }
    return items;
};

const createSendboxToolbarItems = chat => {
    const items = [{
        id: 'emoticon',
        icon: 'emoticon',
        label: Lang.string('chat.sendbox.toolbar.emoticon'),
        click: () => {
            console.warn('TODO: App.im.ui.createSendboxToolbarItems.emoticon');
        }
    }, {
        id: 'image',
        icon: 'image',
        label: Lang.string('chat.sendbox.toolbar.image'),
        click: () => {
            console.warn('TODO: App.im.ui.createSendboxToolbarItems.image');
        }
    }, {
        id: 'file',
        icon: 'file-outline',
        label: Lang.string('chat.sendbox.toolbar.file'),
        click: () => {
            console.warn('TODO: App.im.ui.createSendboxToolbarItems.file');
        }
    }, {
        id: 'captureScreen',
        icon: 'content-cut rotate-270 inline-block',
        label: Lang.string('chat.sendbox.toolbar.captureScreen'),
        click: () => {
            console.warn('TODO: App.im.ui.createSendboxToolbarItems.captureScreen');
        }
    }, {
        id: 'setFontSize',
        icon: 'format-size',
        label: Lang.string('chat.sendbox.toolbar.setFontSize'),
        click: () => {
            console.warn('TODO: App.im.ui.createSendboxToolbarItems.setFontSize');
        }
    }];
    let user = profile.user;
    if(user && user.config.showMessageTip) {
        items.push({
            id: 'tips',
            icon: 'comment-question-outline',
            label: Lang.string('chat.sendbox.toolbar.tips'),
            click: () => {
                console.warn('TODO: App.im.ui.createSendboxToolbarItems.tips');
            }
        });
    }
    return items;
};

const sendTextMessage = (message, chat) => {
    return Server.sendChatMessage(new ChatMessage({
        content: message,
        user: profile.userId,
        cgid: chat.gid,
    }), chat);
};

const sendEmojiMessage = (emojicon, chat) => {
    return Server.sendChatMessage(new ChatMessage({
        contentType: 'image',
        content: JSON.stringify({type: 'emoji', content: emoticon}),
        user: profile.userId,
        cgid: chat.gid,
    }), chat);
};

const linkMembersInText = (text, format = '<a class="link-app {className}" href="#Member/{id}">@{displayName}</a>') => {
    if(text.indexOf('@') > -1) {
        const userAccount = profile.userAccount;
        members.forEach(m => {
            text = text.replace(new RegExp('@(' + m.account + '|' + m.realname + ')', 'g'), StringHelper.format(format, {displayName: m.displayName, id: m.id, account: m.account, className: m.account === userAccount ? 'at-me' : ''}));
        });
    }
    return text;
}

profile.onSwapUser(user => {
    activedChatId = null;
    activeCaches = {};
});

chats.onChatsInit(initChats => {
    if(!activedChatId) {
        const lastActiveChat = chats.getLastActiveChat();
        activedChatId = lastActiveChat && lastActiveChat.gid;
    }
});

export default {
    activeChat,
    onActiveChat,
    mapCacheChats,
    isActiveChat,
    activeAndMapCacheChats,
    createChatToolbarItems,
    createSendboxToolbarItems,
    sendTextMessage,
    sendEmojiMessage,
    linkMembersInText,

    get currentActiveChatId() {
        return activedChatId;
    },

    get currentActiveChat() {
        return activedChatId && chats.get(activedChatId);
    },
};
