import Server from '../server';
import imServerHandlers from './im-server-handlers';
import Events from '../events';
import profile from '../profile';
import members from '../members';
import chats from './im-chats';
import PKG from '../../package.json';
import Config from 'Config';
import Chat from '../models/chat';
import API from '../../network/api';
import Messager from '../../components/messager';
import StringHelper from '../../utils/string-helper';
import ChatMessage from '../../core/models/chat-message';
import Lang from '../../lang';

const MAX_BASE64_IMAGE_SIZE = 1024*10;

const EVENT = {
    history: 'im.chats.history'
};

let chatJoinTask = null;

Server.socket.setHandler(imServerHandlers);

const fetchChatHistory = (cgid, pager) => {
    pager = Object.assign({
        recPerPage: 50,
        pageID: 1,
        recTotal: 0,
        continued: true
    }, pager);
    return Server.socket.send({
        'method': 'history',
        'params': [cgid, pager.recPerPage, pager.pageID, pager.recTotal, pager.continued]
    });
};

const updateChatHistory = (cgid, messages, pager, socket) => {
    if(messages && messages.length) {
        chats.updateChatMessages(messages, true);
    }

    pager.gid = cgid;
    pager.isFetchOver = pager.pageID * pager.recPerPage >= pager.recTotal;
    if(pager.continued && !pager.isFetchOver) {
        fetchChatHistory(cgid, {
            recPerPage: pager.recPerPage,
            pageID: pager.pageID + 1,
            recTotal: pager.recTotal,
            continued: true
        }, socket);
    }
    Events.emit(EVENT.history, messages, pager);
};

const onChatHistory = listener => {
    return Events.on(EVENT.history, listener);
};

const createChat = chat => {
    return Server.socket.sendAndListen({
        'method': 'create',
        'params': [
            chat.gid,
            chat.name || '',
            chat.type,
            chat.members,
            0,
            false
        ]
    }).then(chat => {
        if(chat) {
           const groupUrl = `#/chats/groups/${chat.gid}`;
           if(chat.isGroup) {
               sendBoardChatMessage(Lang.format('chat.createNewChat.format', `[**[${chat.getDisplayName({members, user: profile.user})}](${groupUrl})**]`), chat);
           }
        }
        return Promise.resolve(chat);
    });
};

const createLocalChatWithMembers = (chatMembers, chatSetting) => {
    if(!Array.isArray(chatMembers)) {
        chatMembers = [chatMembers];
    }
    const userMeId = profile.user.id;
    chatMembers = chatMembers.map(member => {
        if(typeof member === 'object') {
            return member.id;
        } else {
            return member;
        }
    });
    if(!chatMembers.find(memberId => memberId === userMeId)) {
        chatMembers.push(userMeId);
    }
    let chat = null;
    if(chatMembers.length === 2) {
        const gid = chatMembers.sort().join('&');
        chat = get(gid);
        if(!chat) {
            chat= new Chat(Object.assign({
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
    let chat = createLocalChatWithMembers(chatMembers, chatSettings);
    if(chat.id) {
        return Promise.resolve(chat);
    } else {
        return createChat(chat);
    }
};

const fetchPublicChats = () => {
    return Server.socket.sendAndListen('getpubliclist');
};

const setCommitters = (chat, committers) => {
    if(committers instanceof Set) {
        committers = Array.from(committers);
    }
    if(Array.isArray(committers)) {
        committers = committers.join(',');
    }
    return Server.socket.send({
        'method': 'setCommitters',
        'params': [chat.gid, committers]
    });
};

const toggleChatPublic = (chat) => {
    return Server.socket.send({
        'method': 'changePublic',
        'params': [chat.gid, !!!chat.public]
    });
};

const toggleChatStar = (chat) => {
    return Server.socket.send({
        'method': 'star',
        'params': [chat.gid, !chat.star]
    });
};

const sendSocketMessageForChat = (socketMessage, chat) => {
    if(chat.id) {
        return Server.socket.send(socketMessage);
    } else {
        return createChat(chat).then(() => {
            return Server.socket.send(socketMessage);
        });
    }
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
    return sendChatMessage(createBoardChatMessage(message, chat), chat);
};

const createTextChatMessage = (message, chat) => {
    return new ChatMessage({
        content: message,
        user: profile.userId,
        cgid: chat.gid,
    });
};

const sendTextMessage = (message, chat) => {
    return sendChatMessage(createTextChatMessage(message, chat), chat);
};

const createEmojiChatMessage = (emojicon, chat) => {
    return new ChatMessage({
        contentType: 'image',
        content: JSON.stringify({type: 'emoji', content: emojicon}),
        user: profile.userId,
        cgid: chat.gid,
    });
};

const sendEmojiMessage = (emojicon, chat) => {
    return sendChatMessage(createEmojiChatMessage(emojicon, chat), chat);
};

const renameChat = (chat, newName) => {
    if(chat && chat.canRename(profile.user)) {
        if(chat.id) {
            return Server.socket.sendAndListen({
                'method': 'changename',
                'params': [chat.gid, newName]
            }).then(chat => {
                if(chat) {
                    sendBoardChatMessage(Lang.format('chat.rename.someRenameGroup.format', `@${profile.user.account}`, `**${newName}**`), chat);
                }
                return Promise.resolve(chat);
            });
        } else {
            chat.name = newName;
            if(DEBUG) {
                console.error(`Cannot rename a local chat.`, chat);
            }
            return Promise.reject('Cannot rename a local chat.');
        }
    } else {
        return Promise.reject('You have no permission to rename the chat.');
    }
};

const sendChatMessage = (messages, chat) => {
    if(!chat) {
        return Promise.reject('Chat is not set before send messages.');
    }

    if(chat.isReadonly(profile.user)) {
        return Promise.reject(Lang.chat.blockedCommitterTip);
    }

    if(!Array.isArray(messages)) {
        messages = [messages];
    }

    messages.forEach(message => {
        const command = message.getCommand();
        if(command) {
            if(command.action === 'rename') {
                setTimeout(() => {
                    renameChat(chat.gid, command.name);
                }, 500);
            } else if(command.action === 'version') {
                message.content = '```\n$$version = "' + `v${PKG.version}${Config.system.specialVersion ? (' for ' + Config.system.specialVersion) : ''}${DEBUG ? ' [debug]' : ''}` + '";\n```';
            }
        }
    });

    chats.updateChatMessages(messages);

    return sendSocketMessageForChat({
        'method': 'message',
        'params': {
            messages: messages.map(m => m.plainServer())
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
        if(imageFile.base64) {
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

const sendImageMessage = (imageFile, chat) => {
    if(imageFile.size < MAX_BASE64_IMAGE_SIZE) {
        return sendImageAsBase64(imageFile, chat);
    }
    if(API.checkUploadFileSize(profile.user, imageFile.size)) {
        const message = new ChatMessage({
            user: profile.userId,
            cgid: chat.gid,
            date: new Date(),
            contentType: ChatMessage.CONTENT_TYPES.image
        });
        message.attatchFile = imageFile;
        message.imageContent = {
            time: new Date().getTime(),
            name: imageFile.name,
            size: imageFile.size,
            send: 0,
            type: imageFile.type
        };
        sendChatMessage(message, chat);
        API.uploadFile(profile.user, imageFile, {gid: chat.gid}, progress => {
            message.updateImageContent({send: progress});
            sendChatMessage(message, chat);
        }).then(data => {
            message.updateImageContent(Object.assign({}, data, {send: true}));
            sendChatMessage(message, chat);
        }).catch(error => {
            message.updateImageContent({send: false, error: error && Lang.error(error)});
            sendChatMessage(message, chat);
        });
    } else {
        Messager.show(Lang.format('error.UPLOAD_FILE_IS_TOO_LARGE', StringHelper.formatBytes(imageFile.size)));
    }
};

const sendFileMessage = (file, chat) => {
    if(API.checkUploadFileSize(profile.user, file.size)) {
        const message = new ChatMessage({
            user: profile.userId,
            cgid: chat.gid,
            date: new Date(),
            contentType: ChatMessage.CONTENT_TYPES.file
        });
        message.attatchFile = file;
        message.fileContent = {
            time: new Date().getTime(),
            name: file.name,
            size: file.size,
            send: 0,
            type: file.type
        };
        sendChatMessage(message, chat);
        API.uploadFile(profile.user, file, {gid: chat.gid}, progress => {
            message.updateFileContent({send: progress});
            sendChatMessage(message, chat);
        }).then(data => {
            message.updateFileContent(Object.assign({}, data, {send: true}));
            sendChatMessage(message, chat);
        }).catch(error => {
            message.updateFileContent({send: false, error: error && Lang.error(error)});
            sendChatMessage(message, chat);
        });
    } else {
        Messager.show(Lang.from('error.UPLOAD_FILE_IS_TOO_LARGE', StringHelper.formatBytes(file.size)));
    }
};

const inviteMembersToChat = (chat, chatMembers, newChatSetting) => {
    if(chat.canInvite(profile.user)) {
        if(!chat.isOne2One) {
            return Server.socket.sendAndListen({
                'method': 'addmember',
                'params': [chat.gid, chatMembers.map(x => x.id), true]
            });
        } else {
            chatMembers.push(...chat.membersSet);
            return createChatWithMembers(chatMembers, newChatSetting);
        }
    }
};

const joinChat = (chat, join = true) => {
    chatJoinTask = true;
    return Server.socket.sendAndListen({
        'method': 'joinchat',
        'params': [chat.gid, join]
    }).then(theChat => {
        if(theChat && theChat.isMember(profile.userId)) {
            sendBoardChatMessage(Lang.format('chat.join.message', `@${profile.userAccount}`), theChat);
        }
        return Promise.resolve(theChat);
    });
};

const exitChat = (chat) => {
    return joinChat(chat, false).then(theChat => {
        if(theChat && !theChat.isMember(profile.userId)) {
            sendBoardChatMessage(Lang.format('chat.exit.message', `@${profile.userAccount}`), theChat);
        }
        return Promise.resolve(theChat);
    });
};

export default {
    fetchChatHistory,
    updateChatHistory,
    onChatHistory,
    createChat,
    createChatWithMembers,
    setCommitters,
    toggleChatPublic,
    toggleChatStar,
    renameChat,
    sendSocketMessageForChat,
    sendChatMessage,
    joinChat,
    exitChat,
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

    get chatJoinTask() {
        return chatJoinTask;
    },

    set chatJoinTask(flag) {
        chatJoinTask = flag;
    },
};
