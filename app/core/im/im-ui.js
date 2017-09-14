import Events from '../events';
import profile from '../profile';
import chats from './im-chats';
import Lang from '../../lang';
import Server from './im-server';
import ChatMessage from '../models/chat-message';
import members from '../members';
import StringHelper from '../../utils/string-helper';
import MemberProfileDialog from '../../views/common/member-profile-dialog';
import Modal from '../../components/modal';
import ContextMenu from '../../components/context-menu';
import ChatCommittersSettingDialog from '../../views/chats/chat-committers-setting-dialog';
import ChatsHistoryDialog from '../../views/chats/chats-history-dialog';

let activedChatId = null;
let activeCaches = {};

const EVENT = {
    activeChat: 'im.chats.activeChat',
    sendContentToChat: 'im.chats.sendContentToChat',
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

const sendContentToChat = (content, type = 'text', cgid = null) => {
    if(!cgid) {
        cgid = activedChatId;
    }
    return Events.emit(`${EVENT.activeChat}.${cgid}`, {content, type});
};

const onSendContentToChat = (cgid, listener) => {
    return Events.on(`${EVENT.activeChat}.${cgid}`, listener);
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

const createChatToolbarItems = (chat, showSidebarIcon = 'auto') => {
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
        label: Lang.string('chat.toolbor.history'),
        click: () => {
            ChatsHistoryDialog.show(chat);
        }
    });
    if(showSidebarIcon === 'auto') {
        showSidebarIcon = profile.userConfig.isChatSidebarHidden(chat.gid);
    }
    if(showSidebarIcon) {
        items.push({
            id: 'sidebar',
            icon: 'book-open',
            label: Lang.string('chat.toolbor.sidebar'),
            click: () => {
                profile.userConfig.setChatSidebarHidden(chat.gid, false);
            }
        });
    }
    if(chat.isGroupOrSystem) {
        items.push({
            id: 'more',
            icon: 'dots-horizontal',
            label: Lang.string('chat.toolbor.more'),
            click: e => {
                ContextMenu.show({x: e.pageX, y: e.pageY}, createChatToolbarMoreContextMenuItems(chat));
            }
        });
    }
    items[items.length - 1].hintPosition = 'bottom-left';
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

const chatRenamePrompt = chat => {
    Modal.prompt(Lang.string('chat.rename.title'), chat.name, {
        placeholder: Lang.string('chat.rename.newTitle'),
    }).then(newName => {
        if(chat.name !== newName) {
            Server.renameChat(chat, newName);
        }
    });
};

const chatExitConfirm = chat => {
    Modal.confirm(Lang.format('chat.group.exitConfirm', chat.getDisplayName({members, user: profile.user}))).then(result => {
        if(result) {
            Server.exitChat(chat);
        }
    });
};

const createChatContextMenuItems = (chat) => {
    let menu = [];
    if(chat.isOne2One) {
        menu.push({
            label: Lang.string('member.profile.view'),
            click: () => {
                MemberProfileDialog.show(chat.getTheOtherOne({members, user: profile.user}));
            }
        }, {type: 'separator'});
    }

    menu.push({
        label: Lang.string(chat.star ? 'chat.toolbor.unstar' : 'chat.toolbor.star'),
        click: () => {
            Server.toggleChatStar(chat);
        }
    });

    if(chat.canRename(profile.user)) {
        menu.push({
            label: Lang.string('common.rename'),
            click: () => {
                chatRenamePrompt(chat);
            }
        });
    }

    if(chat.canMakePublic(profile.user)) {
        menu.push({
            label: Lang.string(chat.public ? 'chat.public.setPrivate' : 'chat.public.setPublic'),
            click: () => {
                Server.toggleChatPublic(chat);
            }
        });
    }

    if(chat.canExit) {
        menu.push({type: 'separator'}, {
            label: Lang.string('chat.group.exit'),
            click: () => {
                chatExitConfirm(chat);
            }
        });
    }
    return menu;
};

const createChatToolbarMoreContextMenuItems = chat => {
    if(chat.isOne2One) return [];
    let menu = [];
    if(chat.canRename(profile.user)) {
        menu.push({
            label: Lang.string('common.rename'),
            click: () => {
                chatRenamePrompt(chat);
            }
        });
    }

    if(chat.canMakePublic(profile.user)) {
        menu.push({
            label: Lang.string(chat.public ? 'chat.public.setPrivate' : 'chat.public.setPublic'),
            click: () => {
                Server.toggleChatPublic(chat);
            }
        });
    }

    if(chat.canSetCommitters(profile.user)) {
        menu.push({
            label: Lang.string('chat.committers.setCommitters'),
            click: () => {
                ChatCommittersSettingDialog.show(chat);
            }
        })
    }

    if(chat.canExit) {
        menu.push({type: 'separator'}, {
            label: Lang.string('chat.group.exit'),
            click: () => {
                chatExitConfirm(chat);
            }
        });
    }
    return menu;
};

const createChatMemberContextMenuItems = member => {
    let menu = [];
    if(member.account !== profile.userAccount) {
        const gid = chats.getOne2OneChatGid([member, profile.user]);
        if(gid !== activedChatId) {
            menu.push({
                label: Lang.string('chat.atHim'),
                click: () => {
                    sendContentToChat(`@${member.displayName} `);
                }
            }, {
                label: Lang.string('chat.sendMessage'),
                click: () => {
                    window.location.hash = `#/chats/contacts/${gid}`;
                }
            });
        }
    }
    menu.push({
        label: Lang.string('member.profile.view'),
        click: () => {
            MemberProfileDialog.show(member);
        }
    });
    return menu;
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
        content: JSON.stringify({type: 'emoji', content: emojicon}),
        user: profile.userId,
        cgid: chat.gid,
    }), chat);
};

const linkMembersInText = (text, format = '<a class="link-app {className}" data-url="@Member/{id}">@{displayName}</a>') => {
    if(text.indexOf('@') > -1) {
        const userAccount = profile.userAccount;
        members.forEach(m => {
            text = text.replace(new RegExp('@(' + m.account + '|' + m.realname + ')', 'g'), StringHelper.format(format, {displayName: m.displayName, id: m.id, account: m.account, className: m.account === userAccount ? 'at-me' : ''}));
        });
    }
    return text;
};

const createGroupChat = (members) => {
    return Modal.prompt(Lang.string('chat.create.newChatNameTip'), '', {
        placeholder: Lang.string('chat.rename.newTitle'),
    }).then(newName => {
        if(newName) {
            return Server.createChatWithMembers(members, {name: newName});
        } else {
            return Promise.reject(false);
        }
    });
};

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
    createChatContextMenuItems,
    chatExitConfirm,
    chatRenamePrompt,
    createChatToolbarMoreContextMenuItems,
    createGroupChat,
    sendContentToChat,
    onSendContentToChat,
    createChatMemberContextMenuItems,

    get currentActiveChatId() {
        return activedChatId;
    },

    get currentActiveChat() {
        return activedChatId && chats.get(activedChatId);
    },
};
