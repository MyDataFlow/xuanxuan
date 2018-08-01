import chats from './im-chats';
import Chat from '../models/chat';
import profile from '../profile';
import members from '../members';
import imServer from './im-server';
import imUI from './im-ui';

const chatChangename = (msg, socket) => {
    if (msg.isSuccess) {
        const chat = chats.get(msg.data.gid);
        if (chat) {
            chat.name = msg.data.name;
            chats.update(chat);
            return chat;
        }
    }
};

const chatSetcomitters = (msg, socket) => {
    if (msg.isSuccess) {
        const chat = chats.get(msg.data.gid);
        if (chat) {
            chat.committers = msg.data.committers;
            chats.update(chat);
        }
    }
};

const chatAddmember = (msg, socket) => {
    if (!msg.isSuccess) {
        return;
    }
    let chat = chats.get(msg.data.gid);
    if (chat) {
        const serverChatMembers = Chat.create(msg.data).members;
        chat.resetMembers(Array.from(serverChatMembers).map(x => members.get(x)));
        chats.update(chat);
        return chat;
    }
    chat = new Chat(msg.data);
    chats.update(chat);
};

const chatGetlist = (msg, socket) => {
    if (msg.isSuccess) {
        let newChats = null;
        if (typeof msg.data === 'object') {
            newChats = Object.keys(msg.data).map(x => msg.data[x]);
        } else {
            newChats = msg.data;
        }
        imServer.handleInitChats(newChats);
    }
};

const chatCreate = (msg, socket) => {
    if (msg.isSuccess) {
        const chat = new Chat(msg.data);
        chats.update(chat);
        return chat;
    }
};

const chatMessage = (msg, socket) => {
    if (msg.isSuccess) {
        let messages = msg.data;
        if (!Array.isArray(messages)) {
            if (messages.cgid && messages.content) {
                messages = [messages];
            } else {
                messages = Object.keys(messages).map(x => messages[x]);
            }
        }

        if (messages && messages.length) {
            imServer.handleReceiveChatMessages(messages);
        }
    }
};

const chatHistory = (msg, socket) => {
    if (!msg.isSuccess) {
        return;
    }
    let messages = msg.data;
    if (!Array.isArray(messages)) {
        if (messages.cgid && messages.content) {
            messages = [messages];
        } else {
            messages = Object.keys(messages).map(x => messages[x]);
        }
    }

    imServer.updateChatHistory((messages && messages.length) ? messages[0].cgid : null, messages, msg.pager, socket);
};

const chatStar = (msg, socket) => {
    if (msg.isSuccess) {
        const chat = chats.get(msg.data.gid);
        if (chat) {
            chat.star = msg.data.star;
            chats.update(chat);
        }
    }
};

const chatMute = (msg, socket) => {
    if (msg.isSuccess) {
        const chat = chats.get(msg.data.gid);
        if (chat) {
            chat.mute = msg.data.mute;
            chats.update(chat);
        }
    }
};

const chatCategory = (msg, socket) => {
    if (msg.isSuccess) {
        const {gids, category} = msg.data;
        if (gids && gids.length) {
            const chatsForUpdate = gids.map(gid => {
                const chat = chats.get(gid);
                chat.category = category;
                return chat;
            });
            chats.update(chatsForUpdate);
        }
    }
};

const chatJoinchat = (msg, socket) => {
    if (!msg.isSuccess) {
        return;
    }
    if (msg.data.gid) {
        let chat = chats.get(msg.data.gid);
        if (chat) {
            chat.$set(msg.data);
        } else {
            chat = new Chat(msg.data);
        }
        if (chat.isMember(profile.user.id)) {
            chat.makeActive();
            chats.update(chat);
            if (chat.public && imServer.chatJoinTask) {
                imUI.activeChat(chat);
            }
            return chat;
        }
        chats.remove(chat.gid);
        return chat;
    }
    imServer.chatJoinTask = false;
};

const chatHide = (msg, socket) => {
    if (msg.isSuccess) {
        const chat = chats.get(msg.data.gid);
        if (chat) {
            chat.hide = msg.data.hide;
            chats.update(chat);
        }
    }
};

const chatDismiss = (msg, socket) => {
    if (msg.isSuccess) {
        const chat = chats.get(msg.data.gid);
        if (chat) {
            chat.dismissDate = msg.data.dismissDate;
            chats.update(chat);
            return chat;
        }
    }
};

const chatChangepublic = (msg, socket) => {
    if (msg.isSuccess) {
        const chat = chats.get(msg.data.gid);
        if (chat) {
            chat.public = msg.data.public;
            chats.update(chat);
        }
    }
};

const chatGetpubliclist = (msg, socket) => {
    let publicChats;
    if (msg.isSuccess) {
        publicChats = msg.data.map(x => {
            const chat = new Chat(x);
            chat.updateMembersSet(members);
            return chat;
        });
        return publicChats;
    }
    publicChats = [];
    chats.updatePublicChats(publicChats);
};

const chatNotify = (msg, socket) => {
    if (msg.isSuccess) {
        let messages = msg.data;
        if (!Array.isArray(messages)) {
            if (messages.cgid) {
                messages = [messages];
            } else {
                messages = Object.keys(messages).map(x => messages[x]);
            }
        }

        if (messages && messages.length) {
            messages.forEach(x => {x.type = 'notification';});
            chats.updateChatMessages(messages);
        }
    }
};

export default {
    'chat/changename': chatChangename,
    'chat/setcommitters': chatSetcomitters,
    'chat/addmember': chatAddmember,
    'chat/getlist': chatGetlist,
    'chat/create': chatCreate,
    'chat/message': chatMessage,
    'chat/history': chatHistory,
    'chat/star': chatStar,
    'chat/mute': chatMute,
    'chat/category': chatCategory,
    'chat/joinchat': chatJoinchat,
    'chat/hide': chatHide,
    'chat/dismiss': chatDismiss,
    'chat/changepublic': chatChangepublic,
    'chat/getpubliclist': chatGetpubliclist,
    'chat/notify': chatNotify
};
