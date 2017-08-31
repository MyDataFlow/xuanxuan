import Server from '../server';
import imServerHandlers from './im-server-handlers';
import Events from '../events';
import profile from '../profile';
import chats from './im-chats';
import PKG from '../../package.json';
import SystemConfig from '../../resource/config/system.json';

const EVENT = {
    history: 'im.chats.history'
};

let chatJoinTask = null;

Server.socket.setHandler(imServerHandlers);

const fetchChatHistory = (cgid, pager, socket) => {
    socket = socket || server.socket;
    pager = Object.assign({
        recPerPage: 20,
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
        chats.updateChatMessages(messages);
    }

    const pager = msg.pager;
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
    });
};

const createChatWithMembers = (chatMembers, chatSettings) => {
    let chat = chats.createWithMembers(chatMembers, chatSettings);
    if(chat.id) {
        return Promise.resolve(chat);
    } else {
        return createChat(chat);
    }
};

const fetchPublicChats = () => {
    return Server.socket.send('getPublicList');
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

const renameChat = (chat, newName) => {
    if(chat && chat.canRename(profile.user)) {
        if(chat.remoteId) {
            sendSocketMessageForChat({
                'method': 'changeName',
                'params': [chat.gid, newName]
            }, chat);
        } else {
            chat.name = newName;
        }
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
        let command = message.getCommand();
        if(command) {
            if(command.action === 'rename') {
                setTimeout(() => {
                    renameChat(chat.gid, command.name);
                }, 500);
            } else if(command.action === 'version') {
                message.content = '```\n$$version = "' + `v${PKG.version}${SystemConfig.specialVersion ? (' for ' + SystemConfig.specialVersion) : ''}${DEBUG ? ' [debug]' : ''}` + '";\n```';
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

const inviteMembersToChat = (chat, chatMembers, newChatSetting) => {
    if(chat.canInvite(profile.user)) {
        if(!chat.isOne2One) {
            return Server.socket.send({
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
    return Server.socket.send({
        'method': 'joinchat',
        'params': [chat.gid, join]
    });
};

const exitChat = (chat) => {
    return joinChat(chat, false);
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

    get chatJoinTask() {
        return chatJoinTask;
    },

    set chatJoinTask(flag) {
        chatJoinTask = flag;
    },
};
