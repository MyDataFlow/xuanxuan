import Events from './events';
import chats from './im-chats';
import Chat from '../models/chat';
import ChatMessage from '../models/chat-message';
import profile from './profile';
import Lang from './lang';
import members from './members';
import imServer from './im-server';
import imUI from './im-ui';

const chatChangename = (msg, socket) => {
    if(msg.isSuccess) {
        const chat = chats.get(msg.data.gid);
        if(chat) {
            chat.name = msg.data.name;
            chats.update(chat);
        }
    }
};

const chatSetcomitters = (msg, socket) => {
    if(msg.isSuccess) {
        const chat = chats.get(msg.data.gid);
        if(chat) {
            chat.committers = msg.data.committers;
            chats.update(chat);
        }
    }
};

const chatAddmember = (msg, socket) => {
    if(!msg.isSuccess) {
        return;
    }
    const chat = chats.get(msg.data.gid);
    if(chat) {
        let serverChatMembers = Chat.create(msg.data).members;
        let newMembers = [];
        serverChatMembers.forEach(x => {
            if(!chat.members.has(x)) {
                newMembers.push(x);
            }
        });

        if(newMembers.length) {
            const membersNames = newMembers.map(x => members.get(x)).join(',');
            const broadcast = ChatMessage.create({
                type: 'broadcast',
                content: Lang.format('chat.someoneJoinChat', membersNames),
                cgid: chat.gid,
                sendTime: new Date(),
                sender: profile.user
            });
            chats.updateChatMessages(broadcast);
        }

        chat.$set(msg.data);
        chats.update(chat);
    } else {
        chat = new Chat(msg.data);
        chats.update(chat);
    }
};

const chatGetlist = (msg, socket) => {
    if(msg.isSuccess) {
        let newChats = null;
        if(typeof msg.data === 'object') {
            newChats = Object.keys(msg.data).map(x => msg.data[x]);
        } else {
            newChats = msg.data;
        }
        chats.init(newChats);
    }
};

const chatCreate = (msg, socket) => {
    if(msg.isSuccess) {
        chats.update(new Chat(msg.data));
    }
};

const chatMessage = (msg, socket) => {
    if(msg.isSuccess) {
        let messages = msg.data;
        if(!Array.isArray(messages)) {
            if(messages.cgid && messages.content) {
                messages = [messages];
            } else {
                messages = Object.keys(messages).map(x => messages[x]);
            }
        }

        if(messages && messages.length) {
            chats.updateChatMessages(messages);
        }
    }
};



const chatHistory = (msg, socket) => {
    if(!msg.isSuccess) {
        return;
    }
    let messages = msg.data;
    if(!Array.isArray(messages)) {
        if(messages.cgid && messages.content) {
            messages = [messages];
        } else {
            messages = Object.keys(messages).map(x => messages[x]);
        }
    }

    imServer.updateChatHistory(messages.cgid, messages, msg.pager, socket);
};

const chatStar = (msg, socket) => {
    if(msg.isSuccess) {
        let chat = chats.get(msg.data.gid);
        if(chat) {
            chat.star = msg.data.star;
            chats.update(chat);
        }
    }
};

const chatJoinchat = (msg, socket) => {
    if(!msg.isSuccess) {
        return;
    }
    if(msg.data.gid) {
        let chat = chats.get(msg.data.gid);
        if(chat) {
            chat.assign(msg.data);
        } else {
            chat = new Chat(msg.data);
        }
        if(chat.isMember(profile.user.id)) {
            chat.makeActive();
            chats.update(chat);
            if(chat.public && imServer.chatJoinTask) {
                imUI.activeChat(chat);
            }
        } else {
            chats.remove(chat);
        }
    }
    imServer.chatJoinTask = false;
};

const chatHide = (msg, socket) => {
    if(msg.isSuccess) {
        let chat = chats.get(msg.data.gid);
        if(chat) {
            chat.hide = msg.data.hide;
            chats.update(chat);
        }
    }
};

const chatChangepublic = (msg, socket) => {
    if(msg.isSuccess) {
        let chat = chats.get(msg.data.gid);
        if(chat) {
            chat.public = msg.data.public;
            chats.update(chat);
        }
    }
};

const chatGetpubliclist = (msg, socket) => {
    let publicChats;
    if(msg.isSuccess) {
        publicChats = msg.data.map(x => {
            let chat = new Chat(x);
            chat.updateMembersSet(this);
            return chat;
        });
    } else {
        publicChats = [];
    }
    chats.updatePublicChats(publicChats);
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
    'chat/joinchat': chatJoinchat,
    'chat/hide': chatHide,
    'chat/changepublic': chatChangepublic,
};
