import Events from '../events';

let currentActiveChat = null;

const EVENT = {
    activeChat: 'im.chats.active'
};

const activeChat = chat => {
    if(!currentActiveChat || chat.gid !== currentActiveChat.gid) {
        currentActiveChat = chat;
        Events.emit(EVENT.activeChat, chat);
    }
};

const onActiveChat = listener => {
    return Events.on(EVENT.activeChat, listener);
};

export default {
    activeChat,
    onActiveChat
};
