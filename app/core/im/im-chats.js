import Chat from '../models/chat';
import ChatMessage from '../models/chat-message';
import profile from '../profile';
import Events from '../events';
import members from '../members';
import db from '../db';
import StringHelper from '../../utils/string-helper';
import DateHelper from '../../utils/date-helper';
import TaskQueue from '../../utils/task-queue';
import Lang from '../../lang';

const CHATS_LIMIT_DEFAULT = 100;
const MAX_RECENT_TIME = 1000 * 60 * 60 * 24 * 7;
const SEARCH_SCORE_MAP = {
    matchAll: 100,
    matchPrefix: 75,
    include: 50,
    similar: 10
};
const EVENT = {
    init: 'chats.init',
    messages: 'chats.messages',
};
let chats = null;
let publicChats = null;

const app = {
    members,
    get user() {
        return profile.user;
    }
};

const forEach = (callback) => {
    if (chats) {
        Object.keys(chats).forEach(gid => {
            callback(chats[gid]);
        });
    }
};

const get = (gid) => {
    if (!chats) {
        return null;
    }
    let chat = chats[gid];
    if (!chat && gid.includes('&')) {
        const chatMembers = gid.split('&').map(x => Number.parseInt(x, 10));
        chat = new Chat({
            gid,
            members: chatMembers,
            createdBy: profile.user.account,
            type: Chat.TYPES.one2one
        });
        chat.updateMembersSet(members);
        update(chat);
    }
    return chat;
};

const getOne2OneChatGid = members => {
    if (members instanceof Set) {
        members = Array.from(members);
    }
    if (members.length > 2 || !members.length) {
        throw new Error(`Cannot build gid for members count with ${members.length}.`);
    } else if (members.length === 1) {
        members.push(profile.userId);
    }
    return members.map(x => x.id || x).sort().join('&');
};

const getLastActiveChat = () => {
    let lastChat = null;
    forEach(chat => {
        if (!lastChat || lastChat.lastActiveTime < chat.lastActiveTime) {
            lastChat = chat;
        }
    });
    return lastChat;
};

const saveChatMessages = (messages, chat) => {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }

    Events.emit(EVENT.messages, messages);
    if (chat) {
        update(chat);
    }

    // Save messages to database
    if (messages.length) {
        return db.database.chatMessages.bulkPut(messages.map(x => x.plain()));
    } else {
        return Promise.resolve(0);
    }
};

const updateChatMessages = (messages, muted = false) => {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }
    const chatsMessages = {};
    const messagesForUpdate = [];
    messages.forEach(message => {
        message = ChatMessage.create(message);
        messagesForUpdate.push(message);

        if (!chatsMessages[message.cgid]) {
            chatsMessages[message.cgid] = [message];
        } else {
            chatsMessages[message.cgid].push(message);
        }
    });

    const updatedChats = {};
    Object.keys(chatsMessages).forEach(cgid => {
        const chat = get(cgid);
        if (chat && chat.id && chat.isMember(profile.userId)) {
            chat.addMessages(chatsMessages[cgid], profile.userId, true, muted);
            if (muted) {
                chat.muteNotice();
            }
            updatedChats[cgid] = chat;
        }
    });

    update(updatedChats);

    return saveChatMessages(messagesForUpdate);
};

const deleteLocalMessage = (message) => {
    if (message.id) {
        return Promise.reject('Cannot delete a remote chat message.');
    }
    const chat = get(message.cgid);
    chat.removeMessage(message.gid);
    Events.emitDataChange({chats: {[chat.gid]: chat}});
    return db.database.chatMessages.delete(message.gid);
};

const countChatMessages = (cgid, filter) => {
    let collection = db.database.chatMessages.where({cgid});
    if (filter) {
        collection = collection.and(filter);
    }
    return collection.count();
};

const loadChatMessages = (chat, queryCondition, limit = CHATS_LIMIT_DEFAULT, offset = 0, reverse = true, skipAdd = false, rawData = false, returnCount = false) => {
    const cgid = chat ? chat.gid : null;
    let collection = db.database.chatMessages.orderBy('id').and(x => {
        return (!cgid || x.cgid === cgid) && (!queryCondition || queryCondition(x));
    });
    if (reverse) {
        collection = collection.reverse();
    }
    if (offset) {
        collection = collection.offset(offset);
    }
    if (limit) {
        collection = collection.limit(limit);
    }
    if (returnCount) {
        return collection.count(count => {
            return Promise.resolve({gid: cgid, count, chat});
        });
    }
    return collection.toArray(chatMessages => {
        if (chatMessages && chatMessages.length) {
            const result = rawData ? chatMessages : chatMessages.map(ChatMessage.create);
            if (!skipAdd && cgid) {
                chat.addMessages(result, profile.userId, true, true);
                Events.emitDataChange({chats: {[cgid]: chat}});
            }
            return Promise.resolve(result);
        }
        return Promise.resolve([]);
    });
};

const searchChatMessages = (chat, searchKeys = '', minDate = 0, returnCount = false) => {
    if (typeof minDate === 'string') {
        minDate = DateHelper.getTimeBeforeDesc(minDate);
    }
    const keys = searchKeys.toLowerCase().split(' ');
    return loadChatMessages(chat, msg => {
        if (!msg.id || (minDate && msg.date < minDate)) {
            return false;
        }
        for (const key of keys) {
            if (key === '[image]') {
                if (msg.contentType !== 'image') {
                    return false;
                }
            } else if (key === '[file]') {
                if (msg.contentType !== 'file') {
                    return false;
                }
            } else if (msg.contentType === 'text' || msg.content.length < 200) {
                if (!msg.content || !msg.content.toLowerCase().includes(key)) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }, 0, 0, true, true, false, returnCount);
};

const createCountMessagesTask = (countChats, searchKeys, minDateDesc = '') => {
    const minDate = minDateDesc ? DateHelper.getTimeBeforeDesc(minDateDesc) : 0;
    const taskQueue = new TaskQueue();
    taskQueue.add(countChats.map(chat => {
        return {func: searchChatMessages.bind(null, chat, searchKeys, minDate, true), chat};
    }));
    return taskQueue;
};

const update = (chatArr) => {
    if (!chatArr) return;

    if (!Array.isArray(chatArr)) {
        if (chatArr instanceof Chat) {
            chatArr = [chatArr];
        }
    }

    let newchats = null;
    if (Array.isArray(chatArr) && chatArr.length) {
        newchats = {};
        chatArr.forEach(chat => {
            chat = Chat.create(chat);
            newchats[chat.gid] = chat;
        });
    } else {
        newchats = chatArr;
    }

    if (newchats && Object.keys(newchats).length) {
        Object.assign(chats, newchats);
        Events.emitDataChange({chats: newchats});
    }
};

const init = (chatArr) => {
    publicChats = null;
    chats = {};
    if (chatArr && chatArr.length) {
        update(chatArr);
        forEach(chat => {
            if (!chat.hasSetMessages) {
                loadChatMessages(chat);
            }
        });
        Events.emit(EVENT.init, chats);
    }
};

const getAll = () => {
    return chats ? Object.keys(chats).map(x => chats[x]) : [];
};

const query = (condition, sortList) => {
    if (!chats) {
        return [];
    }
    let result = null;
    if (typeof condition === 'object') {
        const conditionObj = condition;
        const conditionKeys = Object.keys(conditionObj);
        condition = chat => {
            for (const key of conditionKeys) {
                if (conditionObj[key] !== chat[key]) {
                    return false;
                }
            }
            return true;
        };
    }
    if (typeof condition === 'function') {
        result = [];
        forEach(chat => {
            if (condition(chat)) {
                result.push(chat);
            }
        });
    } else if (Array.isArray(condition)) {
        result = [];
        condition.forEach(x => {
            const chat = get(x);
            if (chat) {
                result.push(chat);
            }
        });
    } else {
        result = getAll();
    }
    if (sortList && result && result.length) {
        Chat.sort(result, sortList, app);
    }
    return result || [];
};


const getRecents = (includeStar = true, sortList = true) => {
    const all = getAll();
    let recents = null;
    if (all.length < 4) {
        recents = all;
    } else {
        const now = new Date().getTime();
        recents = all.filter(chat => {
            return chat.noticeCount || (includeStar && chat.star) || (chat.lastActiveTime && (now - chat.lastActiveTime) <= MAX_RECENT_TIME);
        });
        if (!recents.length) {
            recents = all.filter(chat => chat.isSystem);
        }
    }
    if (sortList) {
        Chat.sort(recents, sortList, app);
    }
    return recents;
};

const getContactChat = (member) => {
    const members = [member.id, profile.user.id].sort();
    const gid = members.join('&');
    return get(gid);
};

const getContactsChats = (sortList = true, groupedBy = false) => {
    const {user} = profile;
    const contactChats = [];
    if (!user) {
        return contactChats;
    }
    members.forEach(member => {
        if (member.id !== profile.user.id) {
            contactChats.push(getContactChat(member, true));
        }
    });
    if (groupedBy === 'role') {
        const groupedContactChats = {};
        contactChats.forEach(chat => {
            const member = chat.getTheOtherOne(app);
            const isMemberOnline = member.isOnline;
            const role = member.role || '';
            if (!groupedContactChats[role]) {
                groupedContactChats[role] = {id: role, title: members.getRoleName(role), list: [chat], onlineCount: isMemberOnline ? 1 : 0};
            } else {
                groupedContactChats[role].list.push(chat);
                if (isMemberOnline) {
                    groupedContactChats[role].onlineCount += 1;
                }
            }
        });
        const orders = profile.user.config.contactsOrderRole;
        return Object.keys(groupedContactChats).map(role => {
            const group = groupedContactChats[role];
            if (sortList) {
                Chat.sort(group.list, sortList, app);
            }
            return group;
        }).sort((g1, g2) => {
            let result = (g1.id ? (orders[g1.id] || 1) : 0) - (g2.id ? (orders[g2.id] || 1) : 0);
            if (result === 0) {
                result = g1.id > g2.id ? 1 : 0;
            }
            return -result;
        });
    } else if (groupedBy === 'dept') {
        const groupsMap = {};
        Object.keys(members.depts).forEach(deptId => {
            const dept = members.depts[deptId];
            groupsMap[deptId] = {
                id: deptId,
                title: dept.name,
                dept,
                list: [],
                onlineCount: 0
            };
        });
        contactChats.forEach(chat => {
            const member = chat.getTheOtherOne(app);
            const isMemberOnline = member.isOnline;
            const deptId = member.dept;
            if (groupsMap[deptId]) {
                groupsMap[deptId].list.push(chat);
                if (isMemberOnline) {
                    groupsMap[deptId].onlineCount += 1;
                }
            } else {
                const dept = members.getDept(deptId);
                groupsMap[deptId] = {
                    id: deptId,
                    title: dept && dept.name,
                    dept,
                    list: [chat],
                    onlineCount: isMemberOnline ? 1 : 0
                };
            }
        });
        const groupArr = Object.keys(groupsMap).map(deptId => {
            const group = groupsMap[deptId];
            const dept = group.dept;
            if (dept) {
                if (dept.children) {
                    group.children = dept.children.map(x => groupsMap[x.id]);
                }
                if (dept.parents) {
                    group.hasParent = true;
                }
            }
            group.type = 'group';
            group.order = dept && dept.order;
            if (sortList) {
                Chat.sort(group.list, sortList, app);
            }
            return group;
        });
        const deptsSorter = (d1, d2) => {
            let result = (d2.list && d2.list.length ? 1 : 0) - (d1.list && d1.list.length ? 1 : 0);
            if (result === 0) {
                result = (d2.dept ? 1 : 0) - (d1.dept ? 1 : 0);
            }
            return result !== 0 ? result : members.deptsSorter(d1, d2);
        };
        return groupArr.map(x => {
            if (x.children) {
                x.children.sort(deptsSorter);
                const list = x.children;
                if (x.list) {
                    list.push(...x.list);
                }
                x.list = list;
            }
            return x;
        }).filter(x => !x.hasParent).sort(deptsSorter);
    } else if (groupedBy === 'category') {
        const groupedChats = {};
        contactChats.forEach(chat => {
            const categoryId = chat.category || '';
            const categoryName = categoryId || user.config.contactsDefaultCategoryName;
            const member = chat.getTheOtherOne(app);
            const isMemberOnline = member.isOnline;
            if (!groupedChats[categoryName]) {
                groupedChats[categoryName] = {id: categoryId, title: categoryName || Lang.string('chats.menu.group.default'), list: [chat], onlineCount: isMemberOnline ? 1 : 0};
            } else {
                groupedChats[categoryName].list.push(chat);
                if (isMemberOnline) {
                    groupedChats[categoryName].onlineCount += 1;
                }
            }
        });
        const categories = user.config.contactsCategories;
        let timeNow = new Date().getTime();
        let needSaveOrder = false;
        const orderedGroups = Object.keys(groupedChats).map(categoryId => {
            const group = groupedChats[categoryId];
            let savedCategory = categories[categoryId];
            if (!savedCategory) {
                timeNow += 1;
                savedCategory = {
                    order: timeNow,
                    key: timeNow
                };
                categories[categoryId] = savedCategory;
                needSaveOrder = true;
            }
            Object.assign(group, savedCategory);
            if (sortList) {
                Chat.sort(group.list, sortList, app);
            }
            return group;
        }).sort((g1, g2) => {
            let result = g1.order - g2.order;
            if (result === 0) {
                result = g1.id > g2.id ? 1 : -1;
            }
            return -result;
        });
        if (needSaveOrder) {
            user.config.contactsCategories = categories;
        }
        return orderedGroups;
    } else if (sortList) {
        Chat.sort(contactChats, sortList, app);
    }
    return contactChats;
};

const getGroups = (sortList = true, groupedBy = false) => {
    const {user} = profile;
    if (!user) {
        return [];
    }
    const groupChats = query(chat => chat.isGroupOrSystem, sortList);
    if (groupedBy === 'category') {
        const groupedChats = {};
        groupChats.forEach(chat => {
            const categoryId = chat.category || '';
            const categoryName = categoryId || user.config.groupsDefaultCategoryName;
            if (!groupedChats[categoryName]) {
                groupedChats[categoryName] = {id: categoryId, title: categoryName || Lang.string('chats.menu.group.default'), list: [chat]};
            } else {
                groupedChats[categoryName].list.push(chat);
            }
        });
        const groupKeys = Object.keys(groupedChats);
        if (groupKeys.length === 1 && !groupKeys[0]) {
            return groupChats;
        }
        const categories = user.config.groupsCategories;
        let timeNow = new Date().getTime();
        let needSaveOrder = false;
        const orderedGroups = groupKeys.map(categoryId => {
            const group = groupedChats[categoryId];
            let savedCategory = categories[categoryId];
            if (!savedCategory) {
                timeNow += 1;
                savedCategory = {
                    order: timeNow,
                    key: timeNow
                };
                categories[categoryId] = savedCategory;
                needSaveOrder = true;
            }
            Object.assign(group, savedCategory);
            if (sortList) {
                Chat.sort(group.list, sortList, app);
            }
            return group;
        }).sort((g1, g2) => {
            let result = g1.order - g2.order;
            if (result === 0) {
                result = g1.id > g2.id ? 1 : -1;
            }
            return -result;
        });
        if (needSaveOrder) {
            user.config.groupsCategories = categories;
        }
        return orderedGroups;
    }
    return groupChats;
};

const getChatCategories = (type = 'contact') => {
    if (type === 'contact') {
        return getContactsChats(false, 'category');
    } else if (type === 'group') {
        return getGroups(false, 'category');
    }
    return [];
};

const search = (search, chatType) => {
    if (StringHelper.isEmpty(search)) {
        return [];
    }
    search = search.trim().toLowerCase().split(' ');
    if (!search.length) {
        return [];
    }

    const hasChatType = !!chatType;
    const isContactsType = chatType === 'contacts';
    const isGroupsType = chatType === 'groups';

    if (!hasChatType || isContactsType) {
        getContactsChats();
    }

    const caculateScore = (sKey, findIn) => {
        if (StringHelper.isEmpty(sKey) || StringHelper.isEmpty(findIn)) {
            return 0;
        }
        if (sKey === findIn) {
            return SEARCH_SCORE_MAP.matchAll;
        }
        const idx = findIn.indexOf(sKey);
        return idx === 0 ? SEARCH_SCORE_MAP.matchPrefix : (idx > 0 ? SEARCH_SCORE_MAP.include : 0);
    };

    return query(chat => {
        const chatGid = chat.gid.toLowerCase();
        if (hasChatType) {
            if ((isContactsType && !chat.isOne2One) || (isGroupsType && !chat.isGroupOrSystem)) {
                return;
            }
        }

        let score = 0;
        const chatName = chat.getDisplayName(app, false).toLowerCase();
        const pinYin = chat.getPinYin(app);
        let theOtherOneAccount = '';
        let theOtherOneContactInfo = '';
        if (chat.isOne2One) {
            const theOtherOne = chat.getTheOtherOne(app);
            if (theOtherOne) {
                theOtherOneAccount = theOtherOne.account;
                theOtherOneContactInfo += (theOtherOne.email || '') + (theOtherOne.mobile || '');
            } else if (DEBUG) {
                console.warn('Cannot get the other one of chat', chat);
            }
        }
        search.forEach(s => {
            if (StringHelper.isEmpty(s)) {
                return;
            }
            if (s.length > 1) {
                if (s[0] === '#') { // id
                    s = s.substr(1);
                    score += 2 * caculateScore(s, chatGid);
                    if (chat.isSystem || chat.isGroup) {
                        score += 2 * caculateScore(s, chatName);
                        if (chat.isSystem) {
                            score += 2 * caculateScore(s, 'system');
                        }
                    }
                } else if (s[0] === '@') { // account or username
                    s = s.substr(1);
                    if (chat.isOne2One) {
                        score += 2 * caculateScore(s, theOtherOneAccount);
                    }
                }
            }
            score += caculateScore(s, chatName);
            score += caculateScore(s, pinYin);
            if (theOtherOneContactInfo) {
                score += caculateScore(s, theOtherOneContactInfo);
            }
        });
        chat.score = score;
        return score > 0;
    }, ((x, y) => x.score - y.score));
};

const remove = gid => {
    const removeChat = chats[gid];
    if (removeChat) {
        removeChat.delete = true;
        delete chats[gid];
        Events.emitDataChange({chats: {[gid]: removeChat}});
        return true;
    }
    return false;
};

const getChatFiles = (chat, includeFailFile = false) => {
    return loadChatMessages(chat, (x => x.contentType === 'file'), 0).then(fileMessages => {
        let files = null;
        if (fileMessages && fileMessages.length) {
            if (includeFailFile) {
                files = fileMessages.map(fileMessage => fileMessage.fileContent);
            } else {
                files = [];
                fileMessages.forEach(fileMessage => {
                    const fileContent = fileMessage.fileContent;
                    if (fileContent.send === true && fileContent.id) {
                        files.push(fileContent);
                    }
                });
            }
        }
        return Promise.resolve(files || []);
    });
};

const getPublicChats = () => (publicChats || []);

const updatePublicChats = (serverPublicChats) => {
    publicChats = [];
    if (serverPublicChats) {
        if (!Array.isArray(serverPublicChats)) {
            serverPublicChats = [serverPublicChats];
        }
        if (serverPublicChats.length) {
            serverPublicChats.forEach(chat => {
                chat = Chat.create(chat);
                publicChats.push(chat);
            });
        }
    }
    Events.emitDataChange({publicChats});
};


const onChatsInit = listener => {
    return Events.on(EVENT.init, listener);
};

const onChatMessages = listener => {
    return Events.on(EVENT.messages, listener);
};

profile.onSwapUser(user => {
    init();
});

export default {
    init,
    update,
    get,
    getAll,
    getRecents,
    forEach,
    getLastActiveChat,
    query,
    remove,
    search,
    getChatFiles,
    deleteLocalMessage,
    loadChatMessages,
    updateChatMessages,
    saveChatMessages,
    getPublicChats,
    updatePublicChats,
    getContactsChats,
    getGroups,
    onChatsInit,
    onChatMessages,
    getOne2OneChatGid,
    countChatMessages,
    createCountMessagesTask,
    searchChatMessages,
    getChatCategories,
};
