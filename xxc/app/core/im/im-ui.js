import Platform from 'Platform';
import Events from '../events';
import profile from '../profile';
import chats from './im-chats';
import Lang from '../../lang';
import Server from './im-server';
import members from '../members';
import StringHelper from '../../utils/string-helper';
import DateHelper from '../../utils/date-helper';
import Modal from '../../components/modal';
import ContextMenu from '../../components/context-menu';
import ChatCommittersSettingDialog from '../../views/chats/chat-committers-setting-dialog';
import ChatsHistoryDialog from '../../views/chats/chats-history-dialog';
import ChatInviteDialog from '../../views/chats/chat-invite-dialog';
import ChatTipPopover from '../../views/chats/chat-tip-popover';
import EmojiPopover from '../../views/common/emoji-popover';
import HotkeySettingDialog from '../../views/common/hotkey-setting-dialog';
import Markdown from '../../utils/markdown';
import Emojione from '../../components/emojione';
import ChatChangeFontPopover from '../../views/chats/chat-change-font-popover';
import db from '../db';
import ChatAddCategoryDialog from '../../views/chats/chat-add-category-dialog';
import TodoEditorDialog from '../../views/todo/todo-editor-dialog';
import Todo from '../todo';
import {strip} from '../../utils/html-helper';
import {addContextMenuCreator, getMenuItemsForContext, tryAddDividerItem, tryRemoveLastDivider} from '../context-menu';
import ui from '../ui';
import {registerCommand, executeCommand} from '../commander';

let activedChatId = null;
let activeCaches = {};

const EVENT = {
    activeChat: 'im.chats.activeChat',
    sendContentToChat: 'im.chats.sendContentToChat',
    suggestSendImage: 'im.chats.suggestSendImage',
    sendboxFocus: 'im.chat.sendbox.focus'
};

const activeChat = chat => {
    if ((typeof chat === 'string') && chat.length) {
        chat = chats.get(chat);
    }
    if (chat) {
        if (!activedChatId || chat.gid !== activedChatId) {
            activedChatId = chat.gid;
            Events.emit(EVENT.activeChat, chat);
            ui.showMobileChatsMenu(false);
        }
        const urlHash = window.location.hash;
        if (!urlHash.endsWith(`/${chat.gid}`)) {
            window.location.hash = `#/chats/recents/${chat.gid}`;
        }
        activeCaches[chat.gid] = true;
        if (chat.noticeCount) {
            chat.muteNotice();
            chats.saveChatMessages(chat.messages);
        }
    }
};

const activeLastChat = () => {
    const lastChat = chats.getLastRecentChat();
    if (lastChat) {
        activeChat(lastChat);
    }
};

const isActiveChat = chatGid => {
    return activedChatId === chatGid;
};

const onActiveChat = listener => {
    return Events.on(EVENT.activeChat, listener);
};

const sendContentToChat = (content, type = 'text', cgid = null) => {
    if (!cgid) {
        cgid = activedChatId;
    }
    if (type === 'file') {
        Server.sendFileMessage(content, chats.get(cgid));
    } else {
        return Events.emit(`${EVENT.sendContentToChat}.${cgid}`, {content, type});
    }
};

const onSendContentToChat = (cgid, listener) => {
    return Events.on(`${EVENT.sendContentToChat}.${cgid}`, listener);
};

const mapCacheChats = callback => {
    return Object.keys(activeCaches).map(callback);
};

const activeAndMapCacheChats = (chat, callback) => {
    activeChat(chat);
    return mapCacheChats(callback);
};

addContextMenuCreator('chat.toolbar', context => {
    let {chat, showSidebarIcon = 'auto'} = context;
    const items = [];
    if (!chat.isRobot) {
        items.push({
            id: 'star',
            className: chat.star ? 'app-chat-star-icon stared' : 'app-chat-star-icon ',
            icon: 'star-outline',
            label: Lang.string(chat.star ? 'chat.toolbor.unstar' : 'chat.toolbor.star'),
            click: () => {
                Server.toggleChatStar(chat);
            }
        });
    }
    if (chat.canInvite(profile.user)) {
        items.push({
            id: 'invite',
            icon: 'account-multiple-plus',
            label: Lang.string('chat.toolbor.invite'),
            click: () => {
                ChatInviteDialog.show(chat);
            }
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
    if (chat.isRobot) {
        showSidebarIcon = false;
    }
    if (showSidebarIcon === 'auto') {
        showSidebarIcon = profile.userConfig.isChatSidebarHidden(chat.gid, chat.isOne2One);
    }
    if (showSidebarIcon) {
        items.push({
            id: 'sidebar',
            icon: 'book-open',
            label: Lang.string('chat.toolbor.sidebar'),
            click: () => {
                profile.userConfig.setChatSidebarHidden(chat.gid, false);
            }
        });
    }
    const moreItems = getMenuItemsForContext('chat.toolbar.more', {chat});
    if (moreItems && moreItems.length) {
        items.push({
            id: 'more',
            icon: 'dots-horizontal',
            label: Lang.string('chat.toolbor.more'),
            click: e => {
                ContextMenu.show({x: e.pageX, y: e.pageY, direction: 'bottom-left'}, moreItems);
            }
        });
    }
    items[items.length - 1].hintPosition = 'bottom-left';
    return items;
});

const captureAndCutScreenImage = (hiddenWindows = false) => {
    if (Platform.screenshot) {
        const captureScreenChatId = activedChatId;
        Platform.screenshot.captureAndCutScreenImage(0, hiddenWindows).then(image => {
            activeChat(captureScreenChatId);
            return image && sendContentToChat(image, 'image', captureScreenChatId);
        }).catch(error => {
            if (DEBUG) {
                console.warn('Capture screen image error: ', error);
            }
        });
    } else {
        throw new Error(`The platform(${Platform.type}) not support capture screenshot.`);
    }
};

const createCatureScreenContextMenuItems = () => {
    if (!Platform.screenshot) {
        throw new Error(`The platform(${Platform.type}) not support take screenshots.`);
    }
    const items = [{
        id: 'captureScreen',
        label: Lang.string('chat.sendbox.toolbar.captureScreen'),
        click: () => {
            captureAndCutScreenImage();
        }
    }, {
        id: 'hideAndCaptureScreen',
        label: Lang.string('imageCutter.hideCurrentWindowAndCaptureScreen'),
        click: () => {
            captureAndCutScreenImage(true);
        }
    }, {
        type: 'separator'
    }, {
        id: 'captureScreenHotSetting',
        label: Lang.string('imageCutter.setGlobalHotkey'),
        click: () => {
            HotkeySettingDialog.show(Lang.string('imageCutter.setGlobalHotkey'), profile.userConfig.captureScreenHotkey, newHotKey => {
                profile.userConfig.captureScreenHotkey = newHotKey;
            });
        }
    }];
    return items;
};

addContextMenuCreator('chat.sendbox.toolbar', context => {
    const {chatGid, openMessagePreview} = context;
    const {userConfig} = profile;
    const items = [{
        id: 'emoticon',
        icon: 'mdi-emoticon',
        label: Lang.string('chat.sendbox.toolbar.emoticon'),
        click: e => {
            EmojiPopover.show({x: e.pageX, y: e.pageY, target: e.target, placement: 'top'}, emoji => {
                sendContentToChat(`${Emojione.convert(emoji.unicode)} `);
            });
        }
    }];
    if (profile.user.isVersionSupport('fileServer')) {
        items.push({
            id: 'image',
            icon: 'mdi-image',
            label: Lang.string('chat.sendbox.toolbar.image'),
            click: () => {
                Platform.dialog.showOpenDialog({
                    filters: [
                        {name: 'Images', extensions: ['jpg', 'png', 'gif']},
                    ]
                }, files => {
                    if (files && files.length) {
                        sendContentToChat(files[0], 'image', chatGid);
                    }
                });
            }
        }, {
            id: 'file',
            icon: 'mdi-file-outline',
            label: Lang.string('chat.sendbox.toolbar.file'),
            click: () => {
                Platform.dialog.showOpenDialog(null, files => {
                    if (files && files.length) {
                        Server.sendFileMessage(files[0], chats.get(chatGid));
                    }
                });
            }
        });
    }
    if (Platform.screenshot && userConfig) {
        items.push({
            id: 'captureScreen',
            icon: 'mdi-content-cut rotate-270 inline-block',
            label: `${Lang.string('chat.sendbox.toolbar.captureScreen')} ${(userConfig.captureScreenHotkey || '')} (${Lang.string('chat.sendbox.toolbar.moreOptions')})`,
            click: () => {
                captureAndCutScreenImage();
            },
            contextMenu: e => {
                ContextMenu.show({x: e.pageX, y: e.pageY}, createCatureScreenContextMenuItems(chats.get(chatGid)));
                e.preventDefault();
            }
        });
    }
    items.push({
        id: 'setFontSize',
        icon: 'mdi-format-size',
        label: Lang.string('chat.sendbox.toolbar.setFontSize'),
        click: e => {
            ChatChangeFontPopover.show({x: e.pageX, y: e.pageY, target: e.target, placement: 'top'});
        }
    });
    const sendMarkdown = userConfig && userConfig.sendMarkdown;
    items.push({
        id: 'markdown',
        icon: sendMarkdown ? 'mdi-markdown icon-2x' : 'mdi-markdown icon-2x',
        label: Lang.string(sendMarkdown ? 'chat.sendbox.toolbar.markdown.enabled' : 'chat.sendbox.toolbar.markdown.disabled') + (sendMarkdown ? ` (${Lang.string('chat.sendbox.toolbar.moreOptions')})` : ''),
        className: sendMarkdown ? 'selected text-green' : '',
        click: () => {
            userConfig.sendMarkdown = !userConfig.sendMarkdown;
        },
        contextMenu: sendMarkdown ? e => {
            const menuItems = [{
                label: Lang.string('chat.sendbox.toolbar.previewDraft'),
                click: openMessagePreview,
                icon: 'mdi-file-find',
                disabled: !openMessagePreview
            }, {
                icon: 'mdi-help-circle',
                label: Lang.string('chat.sendbox.toolbar.markdownGuide'),
                url: `!openUrlInDialog/${encodeURIComponent('http://wowubuntu.com/markdown/')}/?size=lg&insertCss=${encodeURIComponent('.wikistyle>p:first-child{display:none!important}')}`
            }];
            ui.showContextMenu({x: e.pageX, y: e.pageY, target: e.target, placement: 'top'}, menuItems);
            e.preventDefault();
        } : null
    });
    if (userConfig && userConfig.showMessageTip) {
        items.push({
            id: 'tips',
            icon: 'mdi-comment-question-outline',
            label: Lang.string('chat.sendbox.toolbar.tips'),
            click: e => {
                ChatTipPopover.show({x: e.pageX, y: e.pageY, target: e.target, placement: 'top'});
            }
        });
    }
    return items;
});

const chatRenamePrompt = chat => {
    return Modal.prompt(Lang.string('chat.rename.title'), chat.name, {
        placeholder: Lang.string('chat.rename.newTitle'),
    }).then(newName => {
        if (chat.name !== newName) {
            Server.renameChat(chat, newName);
        }
    });
};

const chatExitConfirm = chat => {
    return Modal.confirm(Lang.format('chat.group.exitConfirm', chat.getDisplayName({members, user: profile.user}))).then(result => {
        if (result) {
            Server.exitChat(chat);
        }
    });
};

const chatDismissConfirm = chat => {
    return Modal.confirm(Lang.format('chat.group.dismissConfirm', chat.getDisplayName({members, user: profile.user}))).then(result => {
        if (result) {
            return Server.dimissChat(chat).then(theChat => {
                if (theChat) {
                    activeLastChat();
                }
                return Promise.resolve(theChat);
            });
        }
    });
};

addContextMenuCreator('chat.menu', context => {
    const {chat, menuType = null, viewType = null} = context;
    const menu = [];
    if (chat.isOne2One) {
        menu.push(...getMenuItemsForContext('member', {member: chat.getTheOtherOne({members, user: profile.user})}));
        tryAddDividerItem(menu);
    }

    if (!chat.isRobot) {
        menu.push({
            label: Lang.string(chat.star ? 'chat.toolbor.unstar' : 'chat.toolbor.star'),
            click: () => {
                Server.toggleChatStar(chat);
            }
        });

        if (profile.user.isVersionSupport('muteChat')) {
            menu.push({
                label: Lang.string(chat.mute ? 'chat.toolbar.cancelMute' : 'chat.toolbar.mute'),
                click: () => {
                    Server.toggleMuteChat(chat);
                }
            });
        }
    }

    if (chat.canRename(profile.user)) {
        menu.push({
            label: Lang.string('common.rename'),
            click: () => {
                chatRenamePrompt(chat);
            }
        });
    }

    if (chat.canMakePublic(profile.user)) {
        menu.push({
            label: Lang.string(chat.public ? 'chat.public.setPrivate' : 'chat.public.setPublic'),
            click: () => {
                Server.toggleChatPublic(chat);
            }
        });
    }

    if (chat.canDismiss(profile.user)) {
        tryAddDividerItem(menu);
        menu.push({
            label: Lang.string('chat.group.dismiss'),
            click: () => {
                chatDismissConfirm(chat);
            }
        });
    }

    if (chat.canExit(profile.user)) {
        tryAddDividerItem(menu);
        menu.push({
            label: Lang.string('chat.group.exit'),
            click: () => {
                chatExitConfirm(chat);
            }
        });
    }

    if (!chat.isDismissed && !chat.isRobot) {
        tryAddDividerItem(menu);
        if (viewType === 'category' && (menuType === 'contacts' || menuType === 'groups')) {
            menu.push({
                label: Lang.string('chats.menu.group.add'),
                click: () => {
                    ChatAddCategoryDialog.show(chat);
                }
            });
        }
        if (chat.canHide && profile.user.isVersionSupport('hideChat')) {
            menu.push({
                label: Lang.string(chat.hidden ? 'chat.toolbar.cancelHide' : 'chat.toolbar.hide'),
                click: () => {
                    Server.toggleHideChat(chat);
                }
            });
        }
    }

    return tryRemoveLastDivider(menu);
});

addContextMenuCreator('chat.toolbar.more', ({chat}) => {
    if (chat.isOne2One) return [];
    const menu = [];
    if (profile.user.isVersionSupport('muteChat')) {
        menu.push({
            label: Lang.string(chat.mute ? 'chat.toolbar.cancelMute' : 'chat.toolbar.mute'),
            click: () => {
                Server.toggleMuteChat(chat);
            }
        });
    }
    if (chat.canRename(profile.user)) {
        menu.push({
            label: Lang.string('common.rename'),
            click: () => {
                chatRenamePrompt(chat);
            }
        });
    }

    if (chat.canMakePublic(profile.user)) {
        menu.push({
            label: Lang.string(chat.public ? 'chat.public.setPrivate' : 'chat.public.setPublic'),
            click: () => {
                Server.toggleChatPublic(chat);
            }
        });
    }

    if (chat.canSetCommitters(profile.user)) {
        menu.push({
            label: Lang.string('chat.committers.setCommitters'),
            click: () => {
                ChatCommittersSettingDialog.show(chat);
            }
        });
    }

    if (chat.canDismiss(profile.user)) {
        if (menu.length) {
            menu.push({type: 'separator'});
        }
        menu.push({
            label: Lang.string('chat.group.dismiss'),
            click: () => {
                chatDismissConfirm(chat);
            }
        });
    }

    if (chat.canExit(profile.user)) {
        if (menu.length) {
            menu.push({type: 'separator'});
        }
        menu.push({
            label: Lang.string('chat.group.exit'),
            click: () => {
                chatExitConfirm(chat);
            }
        });
    }
    return menu;
});

addContextMenuCreator('chat.member', ({member, chat}) => {
    const menu = [];
    if (member.account !== profile.userAccount && chat.isGroupOrSystem) {
        const one2OneGid = chats.getOne2OneChatGid([member, profile.user]);
        menu.push({
            label: Lang.string(`chat.atHim.${member.gender}`, Lang.string('chat.atHim')),
            click: () => {
                sendContentToChat(`@${member.displayName} `);
            }
        }, {
            label: Lang.string('chat.sendMessage'),
            click: () => {
                window.location.hash = `#/chats/contacts/${one2OneGid}`;
            }
        });
    }

    tryAddDividerItem(menu);
    menu.push(...getMenuItemsForContext('member', {member}));

    if (chat.canKickOff(profile.user, member)) {
        tryAddDividerItem(menu);
        menu.push({
            label: Lang.string('chat.kickOffFromGroup'),
            click: () => {
                return Modal.confirm(Lang.format('chat.kickOffFromGroup.confirm', member.displayName)).then(result => {
                    if (result) {
                        return Server.kickOfMemberFromChat(chat, member);
                    }
                    return Promise.reject();
                });
            }
        });
    }
    return menu;
});

const linkMembersInText = (text, {format = '<a class="app-link {className}" data-url="@Member/{id}">@{displayName}</a>'}) => {
    if (text && text.indexOf('@') > -1) {
        const langAtAll = Lang.string('chat.message.atAll');
        text = text.replace(new RegExp(`@(all|${langAtAll})`, 'g'), `<span class="at-all">@${langAtAll}</span>`);

        const userAccount = profile.userAccount;
        members.forEach(m => {
            text = text.replace(new RegExp(`@(${m.account}|${m.realname})`, 'g'), StringHelper.format(format, {displayName: m.displayName, id: m.id, account: m.account, className: m.account === userAccount ? 'at-me' : ''}));
        });
    }
    return text;
};

let onRenderChatMessageContentListener = null;
const renderChatMessageContent = (messageContent, {renderMarkdown = false}) => {
    if (typeof messageContent === 'string' && messageContent.length) {
        if (renderMarkdown) {
            messageContent = Markdown(messageContent);
        } else {
            messageContent = strip(messageContent);
        }
        messageContent = Emojione.toImage(messageContent);
        if (onRenderChatMessageContentListener) {
            messageContent = onRenderChatMessageContentListener(messageContent);
        }
    }
    return messageContent;
};

const onRenderChatMessageContent = listener => {
    onRenderChatMessageContentListener = listener;
};

const createGroupChat = (groupMembers) => {
    return Modal.prompt(Lang.string('chat.create.newChatNameTip'), '', {
        inputProps: {placeholder: Lang.string('chat.rename.newTitle')},
        onSubmit: newName => {
            if (!newName) {
                Modal.alert(Lang.string('chat.rename.newTitleRequired'));
                return false;
            }
        }
    }).then(newName => {
        if (newName) {
            return Server.createChatWithMembers(groupMembers, {name: newName});
        }
        return Promise.reject(false);
    });
};

const renameChatCategory = (group, type = 'contact', newCategoryName = null) => {
    if (newCategoryName === null) {
        return Modal.prompt(Lang.string('chats.menu.group.renameTip'), group.title).then(name => {
            return renameChatCategory(group, type, name);
        });
    }
    if (newCategoryName !== group.title) {
        if (group.id) {
            const isContactType = type === 'contact';
            const renameChats = chats.query(x => ((isContactType ? x.isOne2One : x.isGroupOrSystem) && x.category === group.id), false);
            return Server.setChatCategory(renameChats, newCategoryName).then(() => {
                const categoriesConfigName = isContactType ? 'contactsCategories' : 'groupsCategories';
                const categories = profile.user.config[categoriesConfigName];
                if (!categories[newCategoryName]) {
                    categories[newCategoryName] = categories[group.id];
                }
                delete categories[group.id];
                profile.user.config[categoriesConfigName] = categories;
            });
        } else {
            profile.user.config[type === 'contact' ? 'contactsDefaultCategoryName' : 'groupsDefaultCategoryName'] = newCategoryName;
        }
    }
};

addContextMenuCreator('chat.group', ({group, type = 'contact'}) => {
    const menus = [];
    if (!group.system) {
        menus.push({
            label: Lang.string('chats.menu.group.rename'),
            click: () => {
                renameChatCategory(group, type);
            }
        });
    }
    if (group.id && !group.system) {
        menus.push({
            label: Lang.string('chats.menu.group.delete'),
            click: () => {
                const defaultCategoryName = profile.user.config[type === 'contact' ? 'contactsDefaultCategoryName' : 'groupsDefaultCategoryName'] || Lang.string('chats.menu.group.default');
                return Modal.confirm(Lang.format('chats.menu.group.delete.tip.format', defaultCategoryName), {
                    title: Lang.format('chats.menu.group.delete.confirm.format', group.title)
                }).then(result => {
                    return result && renameChatCategory(group, type, '');
                });
            }
        });
    }
    return menus;
});

const hasMessageContextMenu = message => {
    return message.isTextContent && Platform.clipboard && Platform.clipboard.writeText;
};

addContextMenuCreator('message.text', ({message}) => {
    const items = [];
    if (message.isTextContent && Platform.clipboard && Platform.clipboard.writeText) {
        items.push({
            icon: 'mdi-content-copy',
            label: Lang.string('chat.message.copy'),
            click: () => {
                let copyHtmlText = message._renderedTextContent;
                if (copyHtmlText === undefined) {
                    const contentElement = document.getElementById(`message-content-${message.gid}`);
                    if (contentElement) {
                        copyHtmlText = contentElement.innerHTML;
                    }
                }
                if (copyHtmlText === undefined) {
                    copyHtmlText = message.renderedTextContent(renderChatMessageContent, linkMembersInText);
                }
                if (Platform.clipboard.write) {
                    Platform.clipboard.write({text: strip(copyHtmlText), html: copyHtmlText});
                } else {
                    (Platform.clipboard.writeHTML || Platform.clipboard.writeText)(copyHtmlText);
                }
            }
        });
        if (!message.isPlainTextContent) {
            items.push({
                icon: 'mdi-markdown',
                label: Lang.string('chat.message.copyMarkdown'),
                click: () => {
                    Platform.clipboard.writeText(message.content);
                }
            });
        }
    }
    if (profile.user.isVersionSupport('todo')) {
        if (items.length) {
            items.push('divider');
        }
        items.push({
            label: Lang.string('todo.create'),
            icon: 'mdi-calendar-check',
            click: (item, idx, e) => {
                TodoEditorDialog.show(Todo.createTodoFromMessage(message));
                e.preventDefault();
            }
        });
    }
    return items;
});

profile.onSwapUser(user => {
    activedChatId = null;
    activeCaches = {};
});

chats.onChatsInit(initChats => {
    if (!activedChatId) {
        const lastActiveChat = chats.getLastActiveChat();
        if (lastActiveChat) {
            activedChatId = lastActiveChat && lastActiveChat.gid;
            lastActiveChat.makeActive();
            if (window.location.hash.startsWith('#/chats/')) {
                window.location.hash = `#/chats/recents/${activedChatId}`;
            }
        }
    }
    if (!db.database.isExists) {
        Server.fetchChatsHistory('all', DateHelper.getTimeBeforeDesc('threeMonth'));
        if (DEBUG) {
            console.color('Fetch all history for new database', 'greenPale');
        }
    }
});

if (Platform.screenshot) {
    registerCommand('shortcut.captureScreenHotkey', () => {
        captureAndCutScreenImage();
    });
}

if (Platform.clipboard && Platform.clipboard.getNewImage) {
    registerCommand('suggestClipboardImage', () => {
        if (!profile.userConfig.listenClipboardImage) {
            return;
        }
        const newImage = Platform.clipboard.getNewImage();
        if (newImage) {
            Events.emit(EVENT.suggestSendImage, newImage);
        }
    });
}

const onSuggestSendImage = (listener) => {
    return Events.on(EVENT.suggestSendImage, listener);
};

const emitChatSendboxFocus = (chat, sendboxContent) => {
    Events.emit(EVENT.sendboxFocus, chat, sendboxContent);
    if (profile.userConfig.listenClipboardImage && StringHelper.isEmpty(sendboxContent)) {
        executeCommand('suggestClipboardImage');
    }
};

const onChatSendboxFocus = (listener) => {
    return Events.on(EVENT.sendboxFocus, listener);
};

export default {
    activeChat,
    activeLastChat,
    onActiveChat,
    mapCacheChats,
    isActiveChat,
    activeAndMapCacheChats,
    linkMembersInText,
    renderChatMessageContent,
    chatExitConfirm,
    chatRenamePrompt,
    createGroupChat,
    sendContentToChat,
    onSendContentToChat,
    onRenderChatMessageContent,
    onSuggestSendImage,
    hasMessageContextMenu,
    emitChatSendboxFocus,
    onChatSendboxFocus,

    get currentActiveChatId() {
        return activedChatId;
    },

    get currentActiveChat() {
        return activedChatId && chats.get(activedChatId);
    },
};
