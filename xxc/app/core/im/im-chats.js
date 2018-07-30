import Config from 'Config';
import Md5 from 'md5';
import Chat from '../models/chat';
import ChatMessage from '../models/chat-message';
import NotificationMessage from '../models/notification-message';
import profile from '../profile';
import Events from '../events';
import members from '../members';
import db from '../db';
import StringHelper from '../../utils/string-helper';
import DateHelper from '../../utils/date-helper';
import TaskQueue from '../../utils/task-queue';
import timeSequence from '../../utils/time-sequence';
import Lang from '../../lang';
import Server from '../server';

const CHATS_LIMIT_DEFAULT = Config.ui['chat.flow.size'];
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
    fetchQueueFinish: 'fetch.queue.finish.',
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

const createChatMessage = message => {
    if (message instanceof ChatMessage) {
        return message;
    }
    if (message.type === 'notification') {
        message = NotificationMessage.create(message);
    } else {
        message = ChatMessage.create(message);
    }
    return message;
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
    }
    return Promise.resolve(0);
};

const updateChatMessages = (messages, muted = false, skipOld = false) => {
    if (skipOld === true) {
        skipOld = 60 * 1000 * 60 * 24;
    }
    if (!Array.isArray(messages)) {
        messages = [messages];
    }
    const chatsMessages = {};
    const messagesForUpdate = messages.map(message => {
        message = createChatMessage(message);
        if (!chatsMessages[message.cgid]) {
            chatsMessages[message.cgid] = [message];
        } else {
            chatsMessages[message.cgid].push(message);
        }
        return message;
    });

    const updatedChats = {};
    Object.keys(chatsMessages).forEach(cgid => {
        const chat = get(cgid);
        if (chat && (chat.id || chat.isRobot) && chat.isMember(profile.userId)) {
            chat.addMessages(chatsMessages[cgid], profile.userId, muted, skipOld);
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

const getChatMessages = (chat, queryCondition, limit = CHATS_LIMIT_DEFAULT, offset = 0, reverse = true, skipAdd = true, rawData = false, returnCount = false) => {
    // console.log('getChatMessages', {chat, queryCondition, limit, offset, reverse, skipAdd, rawData, returnCount});
    if (!db.database || !db.database.chatMessages) {
        return Promise.resolve([]);
    } 
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
            const result = rawData ? chatMessages : chatMessages.map(createChatMessage);
            if (!skipAdd && cgid) {
                chat.addMessages(result, profile.userId, true);
                Events.emitDataChange({chats: {[cgid]: chat}});
            }
            return Promise.resolve(result);
        }
        return Promise.resolve([]);
    });
};


let isGetChatMessagesQueueBusy = false;
const fetchChatMessagesQueue = [];
const onFetchQueueFinish = (queueId, listener) => {
    return Events.once(`${EVENT.fetchQueueFinish}${queueId}`, listener);
};
const processChatMessageQueue = () => {
    if (isGetChatMessagesQueueBusy) {
        return;
    }
    if (fetchChatMessagesQueue.length) {
        isGetChatMessagesQueueBusy = true;
        const queueData = fetchChatMessagesQueue.pop();
        const {queueId, chat, queryCondition, limit, offset, reverse, skipAdd, rawData, returnCount} = queueData;
        const handleChatMessageQueueResult = result => {
            Events.emit(`${EVENT.fetchQueueFinish}${queueId}`, result);
            isGetChatMessagesQueueBusy = false;
            processChatMessageQueue();
        };
        getChatMessages(get(chat), queryCondition, limit, offset, reverse, skipAdd, rawData, returnCount).then(handleChatMessageQueueResult).catch(handleChatMessageQueueResult);
    }
};
const getChatMessagesInQueue = (chat, queryCondition, limit = CHATS_LIMIT_DEFAULT, offset = 0, reverse = true, skipAdd = true, rawData = false, returnCount = false) => {
    return new Promise((resolve, reject) => {
        const queueData = {chat: chat.gid, queryCondition, limit, offset, reverse, skipAdd, rawData, returnCount};
        const queueId = Md5(JSON.stringify(queueData));
        queueData.queueId = queueId;
        if (!isGetChatMessagesQueueBusy || fetchChatMessagesQueue.every(x => x.queueId !== queueId)) {
            fetchChatMessagesQueue.push(queueData);
        }
        onFetchQueueFinish(queueId, result => {
            if (result instanceof Error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
        processChatMessageQueue();
    });
};

/**
 * Load chat messages
 *
 * @param {Chat} chat
 */
const loadChatMessages = (chat, inQueue = true) => {
    let loadingOffset = chat.loadingOffset;
    if (loadingOffset === true) {
        return Promise.reject();
    }
    if (!loadingOffset) {
        loadingOffset = 0;
    }
    const limit = loadingOffset ? 20 : CHATS_LIMIT_DEFAULT;
    return (inQueue ? getChatMessagesInQueue : getChatMessages)(chat, null, limit, loadingOffset, true, false).then(chatMessages => {
        if (!chatMessages || chatMessages.length < limit) {
            loadingOffset = true;
        } else {
            loadingOffset += limit;
        }
        chat.loadingOffset = loadingOffset;
        return Promise.resolve(chatMessages);
    });
};

const searchChatMessages = (chat, searchKeys = '', minDate = 0, returnCount = false) => {
    if (typeof minDate === 'string') {
        minDate = DateHelper.getTimeBeforeDesc(minDate);
    }
    const keys = searchKeys.toLowerCase().split(' ');
    return getChatMessages(chat, msg => {
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
            if (chat.visible) {
                newchats[chat.gid] = chat;
            }
        });
    } else {
        newchats = chatArr;
    }

    if (newchats && Object.keys(newchats).length) {
        Object.assign(chats, newchats);
        Events.emitDataChange({chats: newchats});
    }
};

const init = (chatArr, eachCallback) => {
    publicChats = null;
    chats = {};
    if (chatArr && chatArr.length) {
        chatArr.push({
            gid: 'littlexx',
            name: Lang.string('common.littlexx'),
            type: 'robot',
            lastActiveTime: new Date().getTime() - Math.floor(MAX_RECENT_TIME / 2),
            members: [profile.user.id]
        });
        update(chatArr);
        forEach(chat => {
            if (chat.isOne2One) {
                const member = chat.getTheOtherOne(app);
                if (member.temp) {
                    chat.isDeleteOne2One = true;
                    Server.tryGetTempUserInfo(member.id);
                }
            }
            chat.renewUpdateId();
            delete chat.loadingOffset;
            if (eachCallback) {
                eachCallback(chat);
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
            return (chat.noticeCount || (!chat.mute && !chat.hidden)) && !chat.isDeleteOne2One && !chat.isDismissed && (chat.noticeCount || (includeStar && chat.star) || (chat.lastActiveTime && (now - chat.lastActiveTime) <= MAX_RECENT_TIME));
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

const getLastRecentChat = () => {
    let lastActiveTime = 0;
    let lastRecentChat = null;
    forEach(chat => {
        if (!chat.isDeleteOne2One && !chat.isDismissed && lastActiveTime < chat.lastActiveTime) {
            lastActiveTime = chat.lastActiveTime;
            lastRecentChat = chat;
        }
    });
    if (!lastRecentChat) {
        lastRecentChat = getAll().find(x => x.isSystem);
    }
    return lastRecentChat;
};

const getContactChat = (member) => {
    const membersId = [member.id, profile.user.id].sort();
    const gid = membersId.join('&');
    return get(gid);
};

const getContactsChats = (sortList = 'onlineFirst', groupedBy = false) => {
    const {user} = profile;
    let contactChats = [];
    if (!user) {
        return contactChats;
    }

    const contactChatMap = {};
    members.forEach(member => {
        if (member.id !== profile.user.id) {
            contactChatMap[member.id] = getContactChat(member, true);
        }
    });

    query(x => x.isOne2One).forEach(theChat => {
        if (!contactChatMap[theChat.id]) {
            const member = theChat.getTheOtherOne(app);
            contactChatMap[member.id] = theChat;
        }
    });

    contactChats = Object.keys(contactChatMap).map(x => contactChatMap[x]);

    if (groupedBy === 'role') {
        const groupedContactChats = {};
        contactChats.forEach(chat => {
            const member = chat.getTheOtherOne(app);
            const isDeleteOne2One = member.isDeleted;
            if (isDeleteOne2One) {
                chat.isDeleteOne2One = isDeleteOne2One;
            }
            const isMemberOnline = member.isOnline;
            const role = member.role || '';
            const groupName = isDeleteOne2One ? Lang.string('chats.menu.group.deleted') : members.getRoleName(role);
            const groupId = isDeleteOne2One ? '_delete' : role;
            if (!groupedContactChats[groupId]) {
                groupedContactChats[groupId] = {id: groupId, title: groupName, list: [chat], onlineCount: isMemberOnline ? 1 : 0};
                if (isDeleteOne2One) {
                    groupedContactChats[groupId].system = true;
                }
            } else {
                groupedContactChats[groupId].list.push(chat);
                if (isMemberOnline) {
                    groupedContactChats[groupId].onlineCount += 1;
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
            let result = (g2.system ? 1 : 0) - (g1.system ? 1 : 0);
            if (result === 0) {
                result = (g1.id ? (orders[g1.id] || 1) : 0) - (g2.id ? (orders[g2.id] || 1) : 0);
            }
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
            const isDeleteOne2One = member.isDeleted;
            if (isDeleteOne2One) {
                chat.isDeleteOne2One = isDeleteOne2One;
            }
            const isMemberOnline = member.isOnline;
            const groupId = isDeleteOne2One ? '_delete' : member.dept;
            if (groupsMap[groupId]) {
                groupsMap[groupId].list.push(chat);
                if (isMemberOnline) {
                    groupsMap[groupId].onlineCount += 1;
                }
            } else {
                const dept = members.getDept(groupId);
                const groupName = isDeleteOne2One ? Lang.string('chats.menu.group.deleted') : (dept && dept.name);
                groupsMap[groupId] = {
                    id: groupId,
                    title: groupName,
                    dept,
                    list: [chat],
                    onlineCount: isMemberOnline ? 1 : 0
                };
                if (isDeleteOne2One) {
                    groupsMap[groupId].system = true;
                }
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
            let result = (d1.system ? 1 : 0) - (d2.system ? 1 : 0);
            if (result === 0) {
                result = (d2.list && d2.list.length ? 1 : 0) - (d1.list && d1.list.length ? 1 : 0);
            }
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
            if (x.type === 'group' && x.dept && x.dept.children && x.dept.children.length === x.list.length) {
                x.onlySubGroup = true;
            }
            return x;
        }).filter(x => !x.hasParent).sort(deptsSorter);
    } else if (groupedBy === 'category') {
        const groupedChats = {};
        contactChats.forEach(chat => {
            const member = chat.getTheOtherOne(app);
            const isDeleteOne2One = member.isDeleted;
            if (isDeleteOne2One) {
                chat.isDeleteOne2One = isDeleteOne2One;
            }
            const categoryId = isDeleteOne2One ? '_delete' : (chat.category || '');
            const categoryName = isDeleteOne2One ? Lang.string('chats.menu.group.deleted') : (categoryId || user.config.contactsDefaultCategoryName);
            const isMemberOnline = member.isOnline;
            if (!groupedChats[categoryId]) {
                groupedChats[categoryId] = {id: categoryId, title: categoryName || Lang.string('chats.menu.group.default'), list: [chat], onlineCount: isMemberOnline ? 1 : 0};
                if (isDeleteOne2One) {
                    groupedChats[categoryId].system = true;
                }
            } else {
                groupedChats[categoryId].list.push(chat);
                if (isMemberOnline) {
                    groupedChats[categoryId].onlineCount += 1;
                }
            }
        });
        const categories = user.config.contactsCategories;
        let needSaveOrder = false;
        const orderedGroups = Object.keys(groupedChats).map(categoryId => {
            const group = groupedChats[categoryId];
            let savedCategory = categories[categoryId];
            if (!savedCategory) {
                const order = timeSequence();
                savedCategory = {
                    order,
                    key: order
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
            let result = g2.order - g1.order;
            if (result === 0) {
                result = g1.id > g2.id ? -1 : 1;
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
            const isDismissed = chat.isDismissed;
            const isHidden = chat.hide;
            const categoryId = isDismissed ? '_dismissed' : isHidden ? '_hidden' : (chat.category || '');
            const categoryName = isDismissed ? Lang.string('chats.menu.group.dismissed') : isHidden ? Lang.string('chats.menu.group.hidden') : (categoryId || user.config.groupsDefaultCategoryName);
            if (!groupedChats[categoryId]) {
                groupedChats[categoryId] = {id: categoryId, title: categoryName || Lang.string('chats.menu.group.default'), list: [chat]};
                if (isDismissed || isHidden) {
                    groupedChats[categoryId].system = true;
                }
            } else {
                groupedChats[categoryId].list.push(chat);
            }
        });
        const groupKeys = Object.keys(groupedChats);
        if (groupKeys.length === 1 && !groupKeys[0]) {
            return groupChats;
        }
        const categories = user.config.groupsCategories;
        let needSaveOrder = false;
        const orderedGroups = groupKeys.map(categoryId => {
            const group = groupedChats[categoryId];
            let savedCategory = categories[categoryId];
            if (!savedCategory) {
                const order = categoryId === '_dismissed' ? 999999999999 : timeSequence();
                savedCategory = {
                    order,
                    key: order
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
            let result = g2.order - g1.order;
            if (result === 0) {
                result = g1.id > g2.id ? 1 : -1;
            }
            return -result;
        });
        if (needSaveOrder) {
            user.config.groupsCategories = categories;
        }
        return orderedGroups;
    } else {
        
    }
    return groupChats;
};

const getChatCategories = (type = 'contact') => {
    if (type === 'contact') {
        return getContactsChats(false, 'category');
    } else if (type === 'group') {
        const groups = getGroups(false, 'category');
        if (groups.length && groups[0].entityType === 'Chat') {
            return [];
        }
        return groups;
    }
    return [];
};

const search = (searchKeys, chatType) => {
    if (StringHelper.isEmpty(searchKeys)) {
        return [];
    }
    searchKeys = searchKeys.trim().toLowerCase().split(' ');
    if (!searchKeys.length) {
        return [];
    }

    const isContactsType = chatType === 'contacts';
    const isGroupsType = chatType === 'groups';
    const hasChatType = isContactsType || isGroupsType;

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

        // Do not show delete one2one chat in search result
        if (chat.isDeleteOne2One) {
            return;
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
        searchKeys.forEach(s => {
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
    return getChatMessages(chat, (x => x.contentType === 'file'), 0).then(fileMessages => {
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

members.onMembersChange(newMembers => {
    forEach(chat => {
        chat._membersSet = null;
        chat.renewUpdateId();
    });
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
    getChatMessages,
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
    getLastRecentChat,
    loadChatMessages,
};
