import Config from 'Config'; // eslint-disable-line
import Platform from 'Platform'; // eslint-disable-line
import Server from '../server';
import imServerHandlers from './im-server-handlers';
import Events from '../events';
import profile from '../profile';
import members from '../members';
import chats from './im-chats';
import PKG from '../../package.json';
import Chat from '../models/chat';
import Messager from '../../components/messager';
import StringHelper from '../../utils/string-helper';
import DateHelper from '../../utils/date-helper';
import ChatMessage from '../../core/models/chat-message';
import Lang from '../../lang';
import ImageHelper from '../../utils/image';
import FileData from '../models/file-data';
import IMFiles from './im-files';
import {isWebUrl} from '../../utils/html-helper';

const MAX_BASE64_IMAGE_SIZE = 1024 * 10;

const EVENT = {
    history: 'im.chats.history',
    history_start: 'im.chats.history.start',
    history_end: 'im.chats.history.end',
    message_send: 'im.server.message.send',
    message_receive: 'im.server.message.receive',
};

let chatJoinTask = null;

Server.socket.setHandler(imServerHandlers);

let historyFetchingPager = null;

const isFetchingHistory = () => {
    return historyFetchingPager;
};

const fetchChatsHistory = (pager, continued = false, startDate = 0) => {
    if (continued instanceof Date || typeof continued === 'number') {
        startDate = continued;
        continued = false;
    }
    if (pager === 'all') {
        pager = {queue: chats.query(x => !!x.id, true).map(x => x.gid)};
    }
    if (typeof pager === 'string') {
        pager = {queue: [pager]};
    }
    pager = Object.assign({
        recPerPage: 50,
        pageID: 1,
        recTotal: 0,
        continued: true,
        perent: 0,
        finish: [],
        startDate,
    }, historyFetchingPager, pager);
    if (pager.startDate) {
        pager.startDate = DateHelper.createPhpTimestramp(pager.startDate);
    }
    if (!pager.queue || !pager.queue.length) {
        if (DEBUG) {
            console.error('Cannot fetch history, because the fetch queue is empty.', pager);
        }
        return;
    }
    pager.gid = pager.queue[0];
    if (pager.total === undefined) {
        pager.total = pager.finish.length + pager.queue.length;
    }
    if (pager.pageID === 1 && pager.continued && !continued) {
        if (historyFetchingPager) {
            if (DEBUG) {
                console.warn('Server is busy.');
            }
            return;
        }
        Events.emit(EVENT.history_start, pager);
        historyFetchingPager = pager;
    }
    return Server.socket.send({
        method: 'history',
        params: [pager.gid, pager.recPerPage, pager.pageID, pager.recTotal, pager.continued, pager.startDate]
    });
};

const updateChatHistory = (cgid, messages, pager, socket) => {
    if (messages && messages.length) {
        chats.updateChatMessages(messages, true, true);
    }

    const isFetchOver = pager.pageID * pager.recPerPage >= pager.recTotal;
    pager = Object.assign({}, historyFetchingPager, pager, {
        isFetchOver,
    });
    if (pager.continued) {
        if (isFetchOver && pager.queue.length < 2) {
            historyFetchingPager = null;
        } else {
            if (isFetchOver) {
                pager.finish.push(pager.queue.shift());
                pager = Object.assign(pager, {
                    pageID: 1,
                    recTotal: 0,
                });
            } else {
                pager = Object.assign(pager, {
                    pageID: pager.pageID + 1,
                });
            }
            fetchChatsHistory(pager, true);
        }
    }
    pager.total = pager.finish.length + pager.queue.length;
    pager.percent = 100 * (pager.finish.length / pager.total + (pager.recTotal ? ((Math.min(pager.recTotal, pager.pageID * pager.recPerPage) / pager.recTotal)) : 0) / pager.total);
    Events.emit(EVENT.history, pager, messages);

    if (pager.continued && !historyFetchingPager) {
        Events.emit(EVENT.history_end, pager);
    }
};

const onChatHistory = listener => {
    return Events.on(EVENT.history, listener);
};
const onChatHistoryStart = listener => {
    return Events.on(EVENT.history_start, listener);
};
const onChatHistoryEnd = listener => {
    return Events.on(EVENT.history_end, listener);
};

const createChat = chat => {
    return Server.socket.sendAndListen({
        method: 'create',
        params: [
            chat.gid,
            chat.name || '',
            chat.type,
            chat.members,
            0,
            false
        ]
    }).then(theChat => {
        if (theChat) {
            const groupUrl = `#/chats/groups/${theChat.gid}`;
            if (theChat.isGroup) {
                sendBoardChatMessage(Lang.format('chat.createNewChat.format', `@${profile.user.account}`, `[**[${theChat.getDisplayName({members, user: profile.user})}](${groupUrl})**]`), theChat);
            }
        }
        return Promise.resolve(theChat);
    });
};

const createLocalChatWithMembers = (chatMembers, chatSetting) => {
    if (!Array.isArray(chatMembers)) {
        chatMembers = [chatMembers];
    }
    const userMeId = profile.user.id;
    chatMembers = chatMembers.map(member => {
        if (typeof member === 'object') {
            return member.id;
        }
        return member;
    });
    if (!chatMembers.find(memberId => memberId === userMeId)) {
        chatMembers.push(userMeId);
    }
    let chat = null;
    if (chatMembers.length === 2) {
        const gid = chatMembers.sort().join('&');
        chat = chats.get(gid);
        if (!chat) {
            chat = new Chat(Object.assign({
                members: chatMembers,
                createdBy: profile.userAccount,
                type: Chat.TYPES.one2one
            }, chatSetting));
        }
    } else {
        chat = new Chat(Object.assign({
            members: chatMembers,
            createdBy: profile.user.account,
            type: Chat.TYPES.group
        }, chatSetting));
    }
    return chat;
};

const createChatWithMembers = (chatMembers, chatSettings) => {
    const chat = createLocalChatWithMembers(chatMembers, chatSettings);
    if (chat.id) {
        return Promise.resolve(chat);
    }
    return createChat(chat);
};

const fetchPublicChats = () => {
    return Server.socket.sendAndListen('getpubliclist');
};

const setCommitters = (chat, committers) => {
    if (committers instanceof Set) {
        committers = Array.from(committers);
    }
    if (Array.isArray(committers)) {
        committers = committers.join(',');
    }
    return Server.socket.send({
        method: 'setCommitters',
        params: [chat.gid, committers]
    });
};

const toggleChatPublic = (chat) => {
    return Server.socket.send({
        method: 'changePublic',
        params: [chat.gid, !chat.public]
    });
};

const toggleChatStar = (chat) => {
    const sendRequest = () => {
        return Server.socket.send({
            method: 'star',
            params: [chat.gid, !chat.star]
        });
    };
    if (!chat.id) {
        return createChat(chat).then(sendRequest);
    }
    return sendRequest();
};

const toggleMuteChat = (chat) => {
    const sendRequest = () => {
        return Server.socket.send({
            method: 'mute',
            params: [chat.gid, !chat.mute]
        });
    };
    if (!chat.id) {
        return createChat(chat).then(sendRequest);
    }
    return sendRequest();
};

const toggleHideChat = (chat) => {
    const sendRequest = () => {
        return Server.socket.send({
            method: 'hide',
            params: [chat.gid, !chat.hide]
        });
    };
    if (!chat.id) {
        return createChat(chat).then(() => {
            return sendRequest();
        });
    }
    return sendRequest();
};


const setChatCategory = (chat, category) => {
    const isArray = Array.isArray(chat);
    const gids = isArray ? chat.map(x => x.gid) : [chat.gid];
    const sendRequest = () => {
        return Server.socket.send({
            method: 'category',
            params: [gids, category]
        });
    };
    if (!isArray && !chat.id) {
        return createChat(chat).then(() => {
            return sendRequest();
        });
    }
    return sendRequest();
};

const sendSocketMessageForChat = (socketMessage, chat) => {
    if (chat.id) {
        return Server.socket.send(socketMessage);
    }
    return createChat(chat).then(() => {
        return Server.socket.send(socketMessage);
    });
};

const createBoardChatMessage = (message, chat) => {
    return new ChatMessage({
        content: message,
        user: profile.userId,
        cgid: chat.gid,
        type: ChatMessage.TYPES.broadcast
    });
};

const sendBoardChatMessage = (message, chat) => {
    return sendChatMessage(createBoardChatMessage(message, chat), chat, true);
};

const createTextChatMessage = (message, chat) => {
    const {userConfig} = profile;
    return new ChatMessage({
        content: message,
        user: profile.userId,
        cgid: chat.gid,
        contentType: userConfig && userConfig.sendMarkdown ? ChatMessage.CONTENT_TYPES.text : ChatMessage.CONTENT_TYPES.plain
    });
};

const createUrlObjectMessage = (message, chat) => {
    return new ChatMessage({
        content: JSON.stringify({type: ChatMessage.OBJECT_TYPES.url, url: message}),
        user: profile.userId,
        cgid: chat.gid,
        contentType: ChatMessage.CONTENT_TYPES.object
    });
};

const sendTextMessage = (message, chat) => {
    return sendChatMessage(isWebUrl(message) ? createUrlObjectMessage(message, chat) : createTextChatMessage(message, chat), chat);
};

const createEmojiChatMessage = (emojicon, chat) => {
    return new ChatMessage({
        contentType: ChatMessage.CONTENT_TYPES.image,
        content: JSON.stringify({type: 'emoji', content: emojicon}),
        user: profile.userId,
        cgid: chat.gid,
    });
};

const sendEmojiMessage = (emojicon, chat) => {
    return sendChatMessage(createEmojiChatMessage(emojicon, chat), chat, true);
};

const renameChat = (chat, newName) => {
    if (chat && chat.canRename(profile.user)) {
        if (chat.id) {
            return Server.socket.sendAndListen({
                method: 'changename',
                params: [chat.gid, newName]
            }).then(chat => {
                if (chat) {
                    sendBoardChatMessage(Lang.format('chat.rename.someRenameGroup.format', `@${profile.user.account}`, `**${newName}**`), chat);
                }
                return Promise.resolve(chat);
            });
        }
        chat.name = newName;
        if (DEBUG) {
            console.error('Cannot rename a local chat.', chat);
        }
        return Promise.reject('Cannot rename a local chat.');
    }
    return Promise.reject('You have no permission to rename the chat.');
};

const sendChatMessage = async (messages, chat, isSystemMessage = false) => {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }

    if (!chat) {
        chat = chats.get(messages[0].cgid);
        if (!chat) {
            return Promise.reject('Chat is not set before send messages.');
        }
    }

    if (!isSystemMessage && chat.isReadonly(profile.user)) {
        return Promise.reject(Lang.string('chat.blockedCommitterTip'));
    }

    messages.forEach(message => {
        message.order = chat.newMsgOrder();

        const command = message.getCommand();
        if (command) {
            if (command.action === 'version') {
                const specialVersion = Config.system.specialVersion ? ` for ${Config.system.specialVersion}` : '';
                const contentLines = ['```'];
                contentLines.push(
                    `$$version       = '${PKG.version}${PKG.buildVersion ? ('.' + PKG.buildVersion) : ''}${specialVersion}';`,
                    `$$serverVersion = '${profile.user.serverVersion}';`,
                    `$$platform      = '${Platform.type}';`,
                    `$$os            = '${Platform.env.os}';`
                );
                if (Platform.env.arch) {
                    contentLines.push(`$$arch          = '${Platform.env.arch}';`);
                }
                contentLines.push('```');
                message.content = contentLines.join('\n');
            } else if (command.action === 'dataPath' && Platform.ui.createUserDataPath) {
                const contentLines = ['```'];
                contentLines.push(
                    `$$dataPath = '${Platform.ui.createUserDataPath(profile.user, '', '')}';`,
                );
                contentLines.push('```');
                message.content = contentLines.join('\n');
            }
        }
    });

    if (!isSystemMessage) {
        Events.emit(EVENT.message_send, messages, chat);
    }

    chats.updateChatMessages(messages);

    return sendSocketMessageForChat({
        method: 'message',
        params: {
            messages: messages.map(m => {
                const msgObj = m.plainServer();
                if (!profile.user.isVersionSupport('messageOrder')) {
                    delete msgObj.order;
                }
                return msgObj;
            })
        }
    }, chat);
};

const sendImageAsBase64 = (imageFile, chat) => {
    return new Promise((resolve) => {
        const sendBase64 = base64Data => {
            const message = new ChatMessage({
                user: profile.userId,
                cgid: chat.gid,
                contentType: ChatMessage.CONTENT_TYPES.image
            });
            message.imageContent = {
                content: base64Data,
                time: new Date().getTime(),
                name: imageFile.name,
                size: imageFile.size,
                send: true,
                type: 'base64'
            };
            sendChatMessage(message, chat);
            resolve();
        };
        if (imageFile.base64) {
            sendBase64(imageFile.base64);
        } else {
            const reader = new FileReader();
            reader.onload = e => {
                sendBase64(e.target.result);
            };
            reader.readAsDataURL(imageFile.blob || imageFile);
        }
    });
};

const sendImageMessage = async (imageFile, chat, onProgress) => {
    if (imageFile.size < MAX_BASE64_IMAGE_SIZE) {
        return sendImageAsBase64(imageFile, chat);
    }
    if (IMFiles.checkUploadFileSize(imageFile.size)) {
        const message = new ChatMessage({
            user: profile.userId,
            cgid: chat.gid,
            date: new Date(),
            contentType: ChatMessage.CONTENT_TYPES.image
        });
        imageFile = FileData.create(imageFile);
        message.attachFile = imageFile;
        let info = imageFile.imageInfo;
        if (!info) {
            info = await ImageHelper.getImageInfo(imageFile.viewUrl).catch(() => {
                Messager.show(Lang.error('CANNOT_HANDLE_IMAGE'));
                if (DEBUG) {
                    console.warn('Cannot get image information', imageFile);
                }
            });
        }
        imageFile.width = info.width;
        imageFile.height = info.height;
        const imageObj = imageFile.plain();
        delete imageObj.type;
        message.imageContent = imageObj;
        await sendChatMessage(message, chat);
        return IMFiles.uploadFile(imageFile, progress => {
            message.updateImageContent({send: progress});
            sendChatMessage(message, chat);
            if (onProgress) {
                onProgress(progress);
            }
        }).then(data => {
            message.updateImageContent(Object.assign({}, data, {send: true}));
            return sendChatMessage(message, chat);
        }).catch(error => {
            message.updateImageContent({send: false, error: error && Lang.error(error)});
            sendChatMessage(message, chat);
        });
    }
    Messager.show(Lang.format('error.UPLOAD_FILE_IS_TOO_LARGE', StringHelper.formatBytes(imageFile.size)), {type: 'warning'});
    return Promise.reject();
};

const sendFileMessage = (file, chat) => {
    if (IMFiles.checkUploadFileSize(file.size)) {
        const message = new ChatMessage({
            user: profile.userId,
            cgid: chat.gid,
            date: new Date(),
            contentType: ChatMessage.CONTENT_TYPES.file
        });
        file = FileData.create(file);
        file.cgid = chat.gid;
        message.fileContent = file.plain();
        sendChatMessage(message, chat);
        IMFiles.uploadFile(file, progress => {
            message.updateFileContent({send: progress});
            return sendChatMessage(message, chat);
        }).then(data => {
            message.updateFileContent(Object.assign({}, data, {send: true}));
            return sendChatMessage(message, chat);
        }).catch(error => {
            message.updateFileContent({send: false, error: error && Lang.error(error)});
            return sendChatMessage(message, chat);
        });
    } else {
        Messager.show(Lang.format('error.UPLOAD_FILE_IS_TOO_LARGE', StringHelper.formatBytes(file.size)), {type: 'warning'});
    }
};

const inviteMembersToChat = (chat, chatMembers, newChatSetting) => {
    if (chat.canInvite(profile.user)) {
        if (!chat.isOne2One) {
            return Server.socket.sendAndListen({
                method: 'addmember',
                params: [chat.gid, chatMembers.map(x => x.id), true]
            });
        }
        chatMembers.push(...chat.membersSet);
        return createChatWithMembers(chatMembers, newChatSetting);
    }
};

const kickOfMemberFromChat = (chat, kickOfWho) => {
    if (chat.canKickOff(profile.user, kickOfWho)) {
        return Server.socket.sendAndListen({
            method: 'addmember',
            params: [chat.gid, [kickOfWho.id], false]
        });
    }
};

const joinChat = (chat, join = true) => {
    chatJoinTask = true;
    return Server.socket.sendAndListen({
        method: 'joinchat',
        params: [chat.gid, join]
    }).then(theChat => {
        if (theChat && theChat.isMember(profile.userId)) {
            sendBoardChatMessage(Lang.format('chat.join.message', `@${profile.userAccount}`), theChat);
        }
        return Promise.resolve(theChat);
    });
};

const exitChat = (chat) => {
    if (chat.canExit(profile.user)) {
        return joinChat(chat, false).then(theChat => {
            if (theChat && !theChat.isMember(profile.userId)) {
                sendBoardChatMessage(Lang.format('chat.exit.message', `@${profile.userAccount}`), theChat);
            }
            return Promise.resolve(theChat);
        });
    }
    return Promise.reject();
};

const dimissChat = chat => {
    if (chat.canDismiss(profile.user)) {
        return Server.socket.sendAndListen({
            method: 'dismiss',
            params: [chat.gid]
        });
    }
    return Promise.reject();
};

const handleReceiveChatMessages = messages => {
    chats.updateChatMessages(messages);
    Events.emit(EVENT.message_receive, messages);
};

const handleInitChats = (newChats) => {
    chats.init(newChats, chat => {
        if (chat.isOne2One && chat.hide) {
            toggleHideChat(chat);
        }
    });
};

const onSendChatMessages = listener => {
    return Events.on(EVENT.message_send, listener);
};

const onReceiveChatMessages = listener => {
    return Events.on(EVENT.message_receive, listener);
};

export default {
    fetchChatsHistory,
    onChatHistoryStart,
    onChatHistoryEnd,
    onChatHistory,
    isFetchingHistory,
    updateChatHistory,
    createChat,
    createChatWithMembers,
    setCommitters,
    toggleChatPublic,
    toggleChatStar,
    toggleHideChat,
    toggleMuteChat,
    setChatCategory,
    renameChat,
    sendSocketMessageForChat,
    sendChatMessage,
    joinChat,
    exitChat,
    dimissChat,
    inviteMembersToChat,
    fetchPublicChats,
    sendImageMessage,
    sendFileMessage,
    createBoardChatMessage,
    sendBoardChatMessage,
    createTextChatMessage,
    createEmojiChatMessage,
    sendTextMessage,
    sendEmojiMessage,
    handleReceiveChatMessages,
    handleInitChats,
    onSendChatMessages,
    onReceiveChatMessages,
    kickOfMemberFromChat,

    get chatJoinTask() {
        return chatJoinTask;
    },

    set chatJoinTask(flag) {
        chatJoinTask = flag;
    },
};
