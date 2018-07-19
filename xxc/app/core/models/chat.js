import Config from 'Config';
import Entity from './entity';
import Status from '../../utils/status';
import Lang from '../../lang';
import Pinyin from '../../utils/pinyin';
import {ChatMessage} from './index';

const STATUS = new Status({
    local: 0,
    sending: 1,
    fail: 2,
    ok: 3,
}, 0);

const TYPES = {
    one2one: 'one2one',
    group: 'group',
    system: 'system',
    robot: 'robot'
};

const COMMITTERS_TYPES = {
    admins: 'admins',
    whitelist: 'whitelist',
    all: 'all'
};

const DISMISS_VISIBLE_TIME = 1000 * 60 * 60 * 24 * 90;

class Chat extends Entity {
    static NAME = 'Chat';
    static STATUS = STATUS;
    static TYPES = TYPES;
    static COMMITTERS_TYPES = COMMITTERS_TYPES;
    static SCHEMA = Entity.SCHEMA.extend({
        user: {type: 'int', indexed: true},
        type: {type: 'string', indexed: true},
        name: {type: 'string', indexed: true},
        createdDate: {type: 'timestamp', indexed: true},
        createdBy: {type: 'string', indexed: true},
        editedDate: {type: 'timestamp'},
        lastActiveTime: {type: 'timestamp', indexed: true},
        dismissDate: {type: 'timestamp', indexed: true},
        star: {type: 'boolean', indexed: true},
        mute: {type: 'boolean', indexed: true},
        public: {type: 'boolean', indexed: true},
        admins: {type: 'set'},
        members: {
            type: 'set',
            setter: (val, obj) => {
                obj._membersSet = null;
                return val;
            }
        },
        committers: {type: 'string'},
        category: {type: 'string'},
    });

    constructor(data, entityType = Chat.NAME) {
        super(data, entityType);

        this._status = STATUS.create(this.$.status);
        this._status.onChange = newStatus => {
            this.$.status = newStatus;
            if (typeof this.onStatusChange === 'function') {
                this.onStatusChange(newStatus, this);
            }
        };

        this._maxMsgOrder = 0;
    }

    get maxMsgOrder() {
        return this._maxMsgOrder;
    }

    newMsgOrder() {
        this._maxMsgOrder += 1;
        return this._maxMsgOrder;
    }

    ensureGid() {
        if (this.isOne2One) {
            this.$.gid = Array.from(this.members).sort().join('&');
        } else {
            super.ensureGid();
        }
    }

    get schema() {
        return Chat.SCHEMA;
    }

    set id(remoteId) {
        super.id = remoteId;
        this._status.change(remoteId ? STATUS.ok : STATUS.fail);
    }

    get id() {
        return this.$get('id');
    }

    // Chat status

    get status() {
        return this._status.value;
    }

    get statusName() {
        return this._status.name;
    }

    isStatus(status) {
        return this._status.is(status);
    }

    get isOK() {
        return this.isStatus(STATUS.ok);
    }

    get type() {
        let type = this.$get('type');
        if (!type) {
            const members = this.members;
            type = (members && members.size === 2) ? TYPES.one2one : TYPES.group;
        }
        return type;
    }

    get isRobot() {
        return this.type === TYPES.robot;
    }

    set type(type) {
        this.$set('type', type);
    }

    get isOne2One() {
        return this.type === TYPES.one2one;
    }

    get isDeleteOne2One() {
        return this.isOne2One && this._isDeleteOne2One;
    }

    set isDeleteOne2One(flag) {
        if (this.isOne2One) {
            this._isDeleteOne2One = flag;
        }
    }

    get isGroup() {
        return this.type === TYPES.group;
    }

    get category() {
        return this.$get('category');
    }

    set category(name) {
        return this.$set('category', name);
    }

    get name() {
        return this.$get('name', `[Chat-${this.id}]`);
    }

    set name(newName) {
        this.$set('name', newName);
    }

    getDisplayName(app, includeMemberCount = false) {
        const name = this.name;
        if (this.isRobot) {
            includeMemberCount = false;
        }
        if (this.isOne2One) {
            const otherOne = this.getTheOtherOne(app);
            return otherOne ? otherOne.displayName : Lang.string('chat.tempChat.name');
        } else if (this.isSystem) {
            if (includeMemberCount) {
                return Lang.format('chat.groupName.format', name || Lang.string('chat.systemGroup.name'), Lang.string('chat.all'));
            }
            return name || Lang.string('chat.systemGroup.name');
        } else if (name !== undefined && name !== '') {
            if (includeMemberCount) {
                return Lang.format('chat.groupName.format', name, this.membersCount);
            }
            return name;
        }
        return `${Lang.string('chat.group.name')}${this.id || `(${Lang.string('chat.tempChat.name')})`}`;
    }

    getPinYin(app) {
        if (!this._pinyin) {
            const str = app ? this.getDisplayName(app, false) : this.name;
            this._pinyin = Pinyin(str);
        }
        return this._pinyin;
    }

    get star() {
        return this.$get('star');
    }

    set star(star) {
        this.$set('star', star);
    }

    get mute() {
        return this.$get('mute');
    }

    set mute(mute) {
        this.$set('mute', mute);
    }

    get hidden() {
        return this.hide;
    }

    set hidden(hide) {
        this.hide = hide;
    }

    get hide() {
        return this.$get('hide');
    }

    set hide(hide) {
        this.$set('hide', hide);
    }

    get public() {
        return this.$get('public');
    }

    set public(flag) {
        this.$set('public', flag);
    }

    get createdDate() {
        return this.$get('createdDate');
    }

    set createdDate(createdDate) {
        this.$set('createdDate', createdDate);
    }

    get dismissDate() {
        return this.$get('dismissDate');
    }

    set dismissDate(dismissDate) {
        this.$set('dismissDate', dismissDate);
    }

    get isDismissed() {
        return !!this.dismissDate;
    }

    canDismiss(user) {
        return !this.isDismissed && this.isGroup && this.isAdmin(user);
    }

    get admins() {
        return this.$get('admins');
    }

    set admins(admins) {
        this.$set('admins', admins);
    }

    isAdmin(member) {
        if (typeof member !== 'object') {
            member = {remoteId: member, account: member};
        }
        if (this.isSystem && member.isSuperAdmin) {
            return true;
        }
        if (this.isOwner(member)) {
            return true;
        }
        const admins = this.admins;
        if (admins && admins.size) {
            return admins.has(member.id) || admins.has(member.account);
        }
        return false;
    }

    addAdmin(memberId) {
        const admins = this.admins;
        if (typeof memberId === 'object') {
            memberId = memberId.id;
        }
        admins.add(memberId);
        this.admins = admins;
    }

    get committers() {
        const committers = this.$get('committers');
        if (!committers || committers === '$ADMINS') {
            return [];
        }
        return new Set(committers.split(','));
    }

    set committers(committers) {
        this.$set('committers', committers);
    }

    get committersType() {
        const committers = this.$get('committers');
        if ((this.isSystem || this.isGroup) && committers && committers !== '$ALL') {
            if (committers === '$ADMINS') {
                return COMMITTERS_TYPES.admins;
            }
            return COMMITTERS_TYPES.whitelist;
        }
        return COMMITTERS_TYPES.all;
    }

    isCommitter(member) {
        switch (this.committersType) {
        case COMMITTERS_TYPES.admins:
            return this.isAdmin(member);
        case COMMITTERS_TYPES.whitelist:
            if (typeof member === 'object') {
                member = member.id;
            }
            return this.isInWhitelist(member);
        default:
            return true;
        }
    }

    canRename(user) {
        return !this.isRobot && !this.isDismissed && this.isCommitter(user) && !this.isOne2One;
    }

    canInvite(user) {
        return !this.isRobot && !this.isDismissed && (this.isAdmin(user) || this.isCommitter(user)) && (!this.isSystem);
    }

    canKickOff(user, kickOfWho) {
        return !this.isRobot && this.isGroup && !this.isSystem && (!kickOfWho || kickOfWho.id !== user.id) && this.isAdmin(user);
    }

    canMakePublic(user) {
        return !this.isRobot && !this.isDismissed && this.isAdmin(user) && this.isGroup;
    }

    canSetCommitters(user) {
        return !this.isRobot && !this.isDismissed && this.isAdmin(user) && !this.isOne2One;
    }

    isReadonly(member) {
        return this.isRobot || this.isDeleteOne2One || this.isDismissed || !this.isCommitter(member);
    }

    get visible() {
        if (this._visible === undefined) {
            const dismissDate = this.dismissDate;
            if (dismissDate) {
                const now = new Date().getTime();
                this._visible = now <= (dismissDate + DISMISS_VISIBLE_TIME);
            } else {
                this._visible = true;
            }
        }
        return this._visible;
    }

    get visibleDate() {
        const dismissDate = this.dismissDate;
        return dismissDate ? (dismissDate + DISMISS_VISIBLE_TIME) : 0;
    }

    get hasWhitelist() {
        return this.committersType === COMMITTERS_TYPES.whitelist;
    }

    get whitelist() {
        if (this.hasWhitelist) {
            const set = new Set();
            this.committers.forEach(x => {
                x = Number.parseInt(x, 10);
                if (!Number.isNaN(x)) {
                    set.add(x);
                }
            });
            return set;
        }
        return null;
    }

    set whitelist(value) {
        if (!this.isGroupOrSystem) {
            value = '';
        }
        this.$set('committers', value);
    }


    isInWhitelist(memberId, whitelist) {
        if (typeof memberId === 'object') {
            memberId = memberId.id;
        }
        whitelist = whitelist || this.whitelist;
        if (whitelist) {
            return whitelist.has(memberId);
        }
        return false;
    }

    addToWhitelist(memberId) {
        const whitelist = this.whitelist;
        if (whitelist) {
            if (typeof memberId === 'object') {
                memberId = memberId.id;
            }
            if (!whitelist.has(memberId)) {
                whitelist.add(memberId);
                this.whitelist = whitelist;
                return true;
            }
        }
        return false;
    }

    removeFromWhitelist(memberId) {
        const whitelist = this.whitelist;
        if (whitelist) {
            if (typeof memberId === 'object') {
                memberId = memberId.id;
            }
            if (whitelist.has(memberId)) {
                whitelist.delete(memberId);
                this.whitelist = whitelist;
                return true;
            }
        }
        return false;
    }

    get createdBy() {
        return this.$get('createdBy');
    }

    set createdBy(createdBy) {
        this.$set('createdBy', createdBy);
    }

    get members() {
        return this.$get('members');
    }

    set members(newMembers) {
        if (newMembers.length) {
            if (typeof newMembers[0] === 'object') {
                this.resetMembers(newMembers);
            } else {
                this.$set('members', new Set(newMembers));
                this._membersSet = null;
            }
        } else {
            this._membersSet = [];
        }
    }

    get membersCount() {
        const members = this.members;
        return members ? (members.length || members.size) : 0;
    }

    isMember(memberId) {
        if (typeof memberId === 'object') {
            memberId = memberId.id;
        }
        const members = this.members;
        return members && members.has(memberId);
    }

    resetMembers(members) {
        this._membersSet = members;
        this.$set('members', new Set(members.map(member => member.id)));
    }

    addMember(...newMembers) {
        const members = this.members;
        if (!members.size) {
            this._membersSet = [];
        }
        newMembers.forEach(member => {
            if (!members.has(member.id)) {
                members.add(member.id);
                if (this._membersSet) {
                    this._membersSet.push(member);
                }
            }
        });
        this.$set('members', members);
    }

    updateMembersSet(appMembers) {
        this._membersSet = Array.from(this.members).map(memberId => (appMembers.get(memberId)));
        if (this.isGroupOrSystem) {
            this._membersSet = this._membersSet.filter(m => !m.temp);
        }
    }

    getMembersSet(appMembers) {
        if (this.type === TYPES.system) {
            return appMembers.all.filter(x => !x.isDeleted);
        }
        if (!this._membersSet) {
            this.updateMembersSet(appMembers);
        }
        return this._membersSet;
    }

    getTheOtherOne(app) {
        if (this.isOne2One) {
            const appMembers = app.members;
            const currentUserId = app.user.id;
            if (!this._theOtherOneId) {
                this._theOtherOneId = Array.from(this.members).find(x => x !== currentUserId);
            }
            if (this._theOtherOneId) {
                const member = appMembers.get(this._theOtherOneId);
                if (member && member.temp) {
                    this._membersSet = null;
                }
                return member;
            }
            return this._theOtherOne;
        }
        return null;
    }

    isOnline(app) {
        if (this.isOne2One) {
            const otherOne = this.getTheOtherOne(app);
            return otherOne && otherOne.isOnline;
        }
        return true;
    }

    isOwner(user) {
        return user.id === this.createdBy || user.account === this.createdBy;
    }

    get canJoin() {
        return !this.isDismissed && this.public && this.isGroup;
    }

    canExit(user) {
        return this.isGroup && !this.isOwner(user);
    }

    get canHide() {
        return this.isGroup;
    }

    get isSystem() {
        return this.type === TYPES.system || this.type === TYPES.robot;
    }

    get isGroupOrSystem() {
        return this.isGroup || this.isSystem;
    }

    get noticeCount() {
        return this._noticeCount || 0;
    }

    set noticeCount(count) {
        this._noticeCount = count;
    }

    muteNotice() {
        this._noticeCount = 0;
        const mutedMessages = [];
        this._messages.forEach(message => {
            if (message.unread) {
                message.unread = false;
                mutedMessages.push(message);
            }
        });
        this.renewUpdateId();
        return mutedMessages;
    }

    get isMuteOrHidden() {
        return this.mute || this.hidden;
    }

    get messages() {
        return this._messages || [];
    }

    get lastActiveTime() {
        let lastActiveTime = this.$get('lastActiveTime');
        if (!lastActiveTime) {
            lastActiveTime = this.createdDate;
        }
        return lastActiveTime || 0;
    }

    set lastActiveTime(time) {
        this.$set('lastActiveTime', time);
    }

    makeActive() {
        this.lastActiveTime = new Date().getTime();
    }

    get hasSetMessages() {
        return !!this._messages;
    }

    addMessages(messages, userId, localMessage = false, skipOld = false) {
        if (!Array.isArray(messages)) {
            messages = [messages];
        }
        if (!this._messages) {
            this._messages = [];
        }

        if (!messages.length) {
            return;
        }

        let noticeCount = this.noticeCount;
        let lastActiveTime = this.lastActiveTime;
        const now = skipOld ? (new Date().getTime()) : 0;
        messages.forEach(message => {
            if (message.date) {
                const checkMessage = this._messages.find(x => x.gid === message.gid);
                if (checkMessage) {
                    checkMessage.reset(message);
                } else if (skipOld && (now - message.date) > skipOld) {
                    return;
                } else {
                    this._messages.push(message);
                    if (!localMessage && userId !== message.senderId) {
                        message.unread = true;
                        noticeCount += 1;
                    } else {
                        message.unread = false;
                    }
                }
                if (lastActiveTime < message.date) {
                    lastActiveTime = message.date;
                }
                if (message.order) {
                    this._maxMsgOrder = Math.max(this._maxMsgOrder, message.order);
                }
            } else if (DEBUG) {
                console.warn('The message date is not defined.', message);
            }
        });
        this.lastActiveTime = lastActiveTime;
        this.noticeCount = noticeCount;

        this._messages = ChatMessage.sort(this._messages);

        this.renewUpdateId();

        return this;
    }

    get lastMessage() {
        return this._messages && this._messages[this._messages.length - 1];
    }

    removeMessage(messageGid) {
        const messages = this.messages;
        if (messages.length) {
            const findIndex = messages.findIndex(x => (x.id === messageGid || x.gid === messageGid));
            if (findIndex > -1) {
                this._messages.splice(findIndex, 1);
                return true;
            }
        }
        return false;
    }

    get isLoadingOver() {
        return this.loadingOffset === true;
    }

    get isFirstLoaded() {
        return this.loadingOffset !== undefined;
    }

    static create(chat) {
        if (chat instanceof Chat) {
            return chat;
        }
        return new Chat(chat);
    }

    /**
     * Sort chats
     * @param  {array}         chats
     * @param  {array|string}  orders
     * @param  {object}        app
     * @return {array}
     */
    static sort(chats, orders, app) {
        if (chats.length < 2) {
            return chats;
        }
        if (typeof orders === 'function') {
            return chats.sort(orders);
        }
        if (!orders || orders === 'default' || orders === true) {
            orders = ['star', 'notice', 'hide', 'mute', 'lastActiveTime', 'online', 'createDate', 'name', 'id'];
        } else if (orders === 'onlineFirst') {
            orders = ['star', 'notice', 'hide', 'online', 'mute', 'lastActiveTime', 'createDate', 'name', 'id'];
        } else if (typeof orders === 'string') {
            orders = orders.split(' ');
        }
        let isFinalInverse = false;
        if (orders[0] === '-' || orders[0] === -1) {
            isFinalInverse = true;
            orders.shift();
        }
        return chats.sort((y, x) => {
            let result = 0;
            for (let order of orders) {
                if (result !== 0) break;
                if (typeof order === 'function') {
                    result = order(y, x);
                } else {
                    const isInverse = order[0] === '-';
                    if (isInverse) order = order.substr(1);
                    let xValue;
                    let yValue;
                    switch (order) {
                    case 'hide':
                    case 'mute':
                        result = (x[order] ? 0 : 1) - (y[order] ? 0 : 1);
                        break;
                    case 'isSystem':
                    case 'star':
                        result = (x[order] ? 1 : 0) - (y[order] ? 1 : 0);
                        break;
                    case 'online':
                        if (app) {
                            result = (x.isOnline(app) ? 1 : 0) - (y.isOnline(app) ? 1 : 0);
                        }
                        break;
                    default:
                        if (order === 'name' && app) {
                            xValue = x.getDisplayName(app, false);
                            yValue = y.getDisplayName(app, false);
                        } else if (order === 'namePinyin') {
                            xValue = x.getPinYin(app);
                            yValue = y.getPinYin(app);
                        } else {
                            xValue = x[order];
                            yValue = y[order];
                        }
                        if (xValue === undefined || xValue === null) xValue = 0;
                        if (yValue === undefined || yValue === null) yValue = 0;
                        result = xValue > yValue ? 1 : (xValue === yValue ? 0 : -1);
                    }
                    result *= isInverse ? (-1) : 1;
                }
            }
            return result * (isFinalInverse ? (-1) : 1);
        });
    }
}

export default Chat;
