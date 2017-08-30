import Chat from '../models/chat';
import ChatMessage from '../models/chat-message';
import profile from './user-profile';
import Events from './events';
import members from './members';
import db from './db';
import notice from './notice';
import DelayAction from '../utils/delay-action';

const CHATS_LIMIT_DEFAULT = 100;
let chats = null;

const forEach = (callback) => {
    if(chats) {
        Object.keys(chats).forEach(gid => {
            callback(chats[gid]);
        });
    }
};

const get = (gid) => {
    let chat = chats[gid];
    if(!chat && gid.includes('&')) {
        const members = gid.split('&').map(x => Number.parseInt(x));
        chat = new Chat({
            gid,
            members,
            createdBy: profile.user.account,
            type: Chat.TYPES.one2one
        });
        chat.updateMembersSet(members);
    }
    return chat;
};

const updateChatNotice = new DelayAction(() => {
    let total = 0;
    forEach(chat => {
        if(chat.noticeCount) {
            total += chat.noticeCount;
        }
    });
    notice.emit({chats: total});
});

const updateChatMessages = (messages, muted) => {
    if(!Array.isArray(messages)) {
        messages = [messages];
    }
    let chatsMessages = {};
    let messagesForUpdate = [];
    messages.forEach(message => {
        message = ChatMessage.create(message);
        messagesForUpdate.push(message);

        if(!chatsMessages[message.cgid]) {
            chatsMessages[message.cgid] = [message];
        } else {
            chatsMessages[message.cgid].push(message);
        }
    });

    let chats = {};
    Object.keys(chatsMessages).forEach(cgid => {
        const chat = get(cgid);
        if(chat) {
            chat.addMessages(chatsMessages[cgid]);
            if(muted) {
                chat.muted();
            }
            chats[cgid] = chat;
        }
    });

    updateChatNotice.do();

    // Save messages to database
    if(messagesForUpdate.length) {
        return db.database.chatMessages.bulkPut(messagesForUpdate.map(x => x.plain()));
    } else {
        return Promise.resolve(0);
    }
};

const deleteFailedMessage = (message) => {
    if(message.id) {
        return Promise.reject('Cannot delete a remote chat message.');
    }
    const chat = get(message.cgid);
    chat.removeMessage(message.gid);
    Events.emitDataChange({chats: {[chat.gid]: chat}});
    return db.database.chatMessages.delete(gid);
};

const loadChatMessages = (chat, queryObject, limit = CHATS_LIMIT_DEFAULT) => {
    const gid = chat.gid;
    queryObject = queryObject ? Object.assign({gid}, queryObject) : {gid};
    const collection =  db.database.chatMessages.where(queryObject);
    if(limit) {
        collection = collection.limit(limit);
    }
    return collection.toArray(chatMessages => {
        if(chatMessages && chatMessages.length) {
            const result = chatMessages.map(ChatMessage.create);
            if(!queryObject) {
                chat.addMessages(result, true);
                Events.emitDataChange({chats: {[chat.gid]: chat}});
            }
            return Promise.resolve(result);
        } else {
            return Promise.resolve([]);
        }
    });
};

const update = (chatArr) => {
    if(!chatArr) return;

    if(!Array.isArray(chatArr)) {
        chatArr = [chatArr];
    }

    if(!chatArr.length) return;

    let newchats = {};
    chatArr.forEach(chat => {
        chat = Chat.create(chat);
        newchats[chat.gid] = chat;
    });
    Object.assign(chats, newchats);
    Events.emitDataChange({chats: newchats});
};

const init = (chatArr) => {
    chats = {};
    if(chatArr && chatArr.length) {
        update(chatArr);
        forEach(chat => {
            if(!chat.hasSetMessages) {
                loadChatMessages(chat);
            }
        });
    }
};

const getAll = () => {
    return chats ? Object.keys(chats).map(x => chats[x]) : [];
};


const query = (condition, sortList, app) => {
    if(!chats) {
        return [];
    }
    let result = null;
    if(typeof condition === 'object') {
        let conditionObj = condition;
        let conditionKeys = Object.keys(conditionObj);
        condition = chat => {
            for(let key of conditionKeys) {
                if(conditionObj[key] !== chat[key]) {
                    return false;
                }
            }
            return true;
        };
    }
    if(typeof condition === 'function') {
        result = [];
        forEach(chat => {
            if(condition(chat)) {
                result.push(chat);
            }
        });
    } else if(Array.isArray(condition)) {
        result = [];
        condition.forEach(x => {
            const chat = get(x);
            if(chat) {
                result.push(chat);
            }
        });
    } else {
        result = getAll();
    }
    if(sortList && result && result.length) {
        Chat.sort(result, sortList, app);
    }
    return result || [];
};

const remove = gid => {
    if(chats[gid]) {
        delete chats[gid];
        return true;
    } else {
        return false;
    }
};

const getChatFiles = (chat, includeFailFile = false) => {
    return getChatFiles(chat, {contentType: 'file'}, 0).then(fileMessages => {
        let files = null;
        if(fileMessages && fileMessages.length) {
            if(includeFailFile) {
                files = fileMessages.map(fileMessage => fileMessage.fileContent);
            } else {
                files = [];
                fileMessages.forEach(fileMessage => {
                    const fileContent = fileMessage.fileContent;
                    if(fileContent.send === true && fileContent.id) {
                        files.push(fileContent);
                    }
                });
            }
        }
        return Promise.resolve(files || []);
    });
};

profile.onSwapUser(user => {
    init();
});

Events.onDataChange(data => {
    if(data.chats) {
        update(data.chats);
    }
});

export default {
    init,
    update,
    get,
    getAll,
    forEach,
    query,
    remove,
    getChatMessages,
    getChatFiles,
    deleteFailedMessage,
    loadChatMessages,
    updateChatMessages
};
