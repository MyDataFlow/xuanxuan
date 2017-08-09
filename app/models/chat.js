import Entity from './entity';
import Status from '../utils/status';
import Lang from '../resource/lang';
import Pinyin from '../utils/pinyin';
import Platform from 'Platform';

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
};

const COMMITTERS_TYPES = {
    admins: 'admins',
    whitelist: 'whitelist',
    all: 'all'
};

const EVENT = {
    message: 'chat.message'
};

const MAX_MESSAGE_COUNT = 100;

class Chat extends Entity {

    static NAME = 'Chat';
    static STATUS = STATUS;
    static TYPES = TYPES;
    static EVENT = EVENT;
    static CONTENT_TYPES = CONTENT_TYPES;
    static SCHEMA = Entity.SCHEMA.extend({
        user: {type: 'int', indexed: true},
        type: {type: 'string', indexed: true},
        name: {type: 'string', indexed: true},
        createdDate: {type: 'timestamp', indexed: true},
        lastActiveTime: {type: 'timestamp', indexed: true},
        createdBy: {type: 'int', indexed: true},
        star: {type: 'boolean', indexed: true},
        lastActiveTime: {type: 'timestramp', indexed: true},
        mute: {type: 'boolean', indexed: true},
        public: {type: 'boolean', indexed: true},
        admins: {type: 'set'},
        members: {type: 'set'},
        committers: {type: 'set'},
    });

    constructor(data, entityType = Chat.NAME) {
        super(data, entityType);

        this._status = STATUS.create(this.$.status);
        this._status.onChange = newStatus => {
            this.$.status = newStatus;
            if(typeof this.onStatusChange === 'function') {
                this.onStatusChange(newStatus, this);
            }
        };
    }

    ensureGid() {
        if(this.isOne2One) {
            this.$.gid = Array.from(data.members).sort().join('&');
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
        if(!type) {
            type = this.members.size === 2 ? TYPES.one2one : TYPES.group;
        }
        return type;
    }

    set type(type) {
        this.$set('type', type);
    }

    get isOne2One() {
        return this.type === TYPES.one2one;
    }

    get isGroup() {
        return this.type === TYPES.group;
    }

    get name() {
        return this.$get('name', `[Chat-${this.id}]`);
    }

    set name(newName) {
        this.$set('name', newName);
    }

    getDisplayName(app, includeMemberCount = true) {
        let name = this.name;
        if(this.isOne2One) {
            let otherOne = this.getTheOtherOne(app);
            return otherOne ? otherOne.displayName : Lang.chat.tempChat;
        } else if(this.isSystem) {
            if(includeMemberCount) {
                return Lang.format('chat.groupNameFormat', name || Lang.chat.systemGroup, Lang.chat.allMembers);
            } else {
                return name || Lang.chat.systemGroup;
            }
        } else if(name !== undefined && name !== '') {
            if(includeMemberCount) {
                return Lang.format('chat.groupNameFormat', name, this.membersCount);
            } else {
                return name;
            }
        } else {
            return `${Lang.chat.chatGroup}${this.id || ('(' + Lang.chat.tempChat + ')')}`;
        }
    }

    getPinYin(app) {
        if(!this._pinyin) {
            let str = app ? this.getDisplayName(app, false) : this.name;
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

    get public() {
        return this.$get('public');
    }

    set public(public) {
        this.$set('public', public);
    }

    get lastActiveTime() {
        return this.$get('lastActiveTime');
    }

    set lastActiveTime(lastActiveTime) {
        this.$set('lastActiveTime', lastActiveTime);
    }

    get createdDate() {
        return this.$get('createdDate');
    }

    set createdDate(createdDate) {
        this.$set('createdDate', createdDate);
    }

    get admins() {
        return this.$get('admins');
    }

    set admins(admins) {
        this.$set('admins', admins);
    }

    isAdmin(member) {
        if(typeof member !== 'object') {
            member = {remoteId: member, account: member};
        }
        if(this.isSystem && member.isSuperAdmin) {
            return true;
        }
        if(this.isOwner(member)) {
            return true;
        }
        let admins = this.admins;
        if(admins && admins.size) {
            return admins.has(member.id) || admins.has(member.account);
        }
        return false;
    }

    addAdmin(memberId) {
        let admins = this.admins;
        if(typeof memberId === 'object') {
            memberId = memberId.id;
        }
        admins.add(memberId);
        this.admins = admins;
    }

    get committers() {
        return this.$get('committers');
    }

    set committers(committers) {
        this.$set('committers', committers);
    }

    get committersType() {
        return this.$get('committersType', COMMITTERS_TYPES.all);
    }

    set committersType(type) {
        if(COMMITTERS_TYPES[type]) {
            this.$set('committersType', type);
        }
    }

    isCommitter(member) {
        switch(this.committersType) {
            case 'admins':
                return this.isAdmin(member);
            case 'whitelist':
                if(typeof member === 'object') {
                    member = member.id;
                }
                return this.isInWhitelist(member);
        }
        return true;
    }

    canRename(user) {
        return this.isCommitter(user) && !this.isOne2One;
    }

    canInvite(user) {
        return this.isCommitter(user) && (!this.isSystem);
    }

    canMakePublic(user) {
        return this.isAdmin(user) && this.isGroup;
    }

    canSetCommitters(user) {
        return this.isAdmin(user) && !this.isOne2One;
    }

    isReadonly(member) {
        return !this.isCommitter(member);
    }

    get hasWhitelist() {
        return this.committersType === COMMITTERS_TYPES.whitelist;
    }

    get whitelist() {
        if(this.hasWhitelist) {
            let set = new Set();
            this.committers.forEach(x => {
                x = Number.parseInt(x);
                if(x !== NaN) {
                    set.add(x);
                }
            });
            return set;
        }
        return null;
    }

    set whitelist(value) {
        if(!this.isGroupOrSystem) {
            value = '';
        }
        this.$set('committers', value);
    }


    isInWhitelist(memberId, whitelist) {
        if(typeof memberId === 'object') {
            memberId = memberId.id;
        }
        whitelist = whitelist || this.whitelist;
        if(whitelist) {
            return whitelist.has(memberId);
        }
        return false;
    }

    addToWhitelist(memberId) {
        let whitelist = this.whitelist;
        if(whitelist) {
            if(typeof memberId === 'object') {
                memberId = memberId.id;
            }
            if(!whitelist.has(memberId)) {
                whitelist.add(memberId);
                this.whitelist = whitelist;
                return true;
            }
        }
        return false;
    }

    removeFromWhitelist(memberId) {
        let whitelist = this.whitelist;
        if(whitelist) {
            if(typeof memberId === 'object') {
                memberId = memberId.id;
            }
            if(whitelist.has(memberId)) {
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

    get membersCount() {
        let members = this.members;
        return members ? members.size : 0;
    }

    isMember(memberId) {
        if(typeof memberId === 'object') {
            memberId = memberId.id;
        }
        let members = this.members;
        return members && members.has(memberId);
    }

    resetMembers(members) {
        this._membersSet = members;
        this.$set('members', new Set(members.map(member => member.id)));
    }

    addMember(...newMembers) {
        let members = this.members;
        if(!members.size) {
            this._membersSet = [];
        }
        newMembers.forEach(member => {
            if(!members.has(member.id)) {
                members.add(member.id);
                if(this._membersSet) {
                    this._membersSet.push(member);
                }
            }
        });
        this.$set('members', members);
    }

    updateMembersSet(app) {
        this._membersSet = Array.from(this.members).map(memberId => membersMap[memberId]);
    }

    getMembersSet(app) {
        const membersMap = app.members;

        if(!this._membersSet) {
            this.updateMembersSet(app);
        }
        return this._membersSet;
    }

    getTheOtherOne(app) {
        const currentUser = app.user;
        const membersMap = app.members;

        if(this.isOne2One && !this._theOtherOne) {
            this._theOtherOne = this.getMembersSet(membersMap).find(member => member.id !== currentUser.id);
        }
        return this._theOtherOne;
    }

    isOnline(app) {
        if(this.isOne2One) {
            let otherOne = this.getTheOtherOne(app);
            return otherOne && otherOne.isOnline;
        }
        return true;
    }

    isOwner(user) {
        return user.id === this.createdBy || user.account === this.createdBy;
    }

    get canJoin() {
        return this.public && this.isGroup;
    }

    get canExit() {
        return this.isGroup;
    }

    get isSystem() {
        return this.type === TYPES.system;
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

    get messages() {
        return this._messages || [];
    }

    set messages(messages) {
        this._messages = [];
        this._noticeCount = 0;
        this.addMessage(messages);
    }

    get lastActiveTime() {
        let lastActiveTime = this.$get('lastActiveTime');
        if(!lastActiveTime) {
            lastActiveTime = this.createdDate;
        }
        return lastActiveTime || 0;
    }

    set lastActiveTime(time) {
        this.$set('lastActiveTime', time);
    }

    addMessage(messages) {
        if(!Array.isArray(messages)) {
            messages = [messages];
        }
        if(!this._messages) {
            this._messages = [];
        }

        if(!messages.length) {
            return;
        }

        let noticeCount = this.noticeCount;
        let newMessageCount = 0;
        let lastActiveTime = this.lastActiveTime;
        messages.forEach(message => {
            let checkMessage = this._messages.find(x => x.gid === message.gid);
            if(checkMessage) {
                checkMessage.reset(message);
            } else {
                this._messages.push(message);
                newMessageCount++;
                if(message.unread) {
                    noticeCount++;
                }
            }
            if(lastActiveTime < message.date) {
                lastActiveTime = message.date;
            }
        });
        this.lastActiveTime = lastActiveTime;
        this.noticeCount = noticeCount;

        if(newMessageCount) {
            this._messages.sort((x, y) => {
                let orderResult = x.date - y.date;
                if(orderResult === 0) {
                    orderResult = (x.id || Number.MAX_SAFE_INTEGER) - (y.id || Number.MAX_SAFE_INTEGER);
                }
                if(orderResult === 0) {
                    orderResult = x.order - y.order;
                }
                return orderResult;
            });
        }

        Platform.events.emit(EVENT.message, messages, this);

        return this;
    }

    removeMessage(messageGid) {
        let messages = this.messages;
        if(messages.length) {
            let findIndex = messages.findIndex(x => {
                x.id === messageGid || x.gid === messageGid
            });
            if(findIndex > -1) {
                this._messages.splice(findIndex, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Sort chats
     * @param  {array}         chats
     * @param  {array|string}  orders
     * @param  {object}        app
     * @return {array}
     */
    static sort(chats, orders, app) {
        if(!orders || orders === 'default') {
            orders = ['star', 'notice', 'lastActiveTime', 'online', 'createDate', 'name', 'id']; // namePinyin
        } else if(typeof orders === 'string') {
            orders = orders.split(' ');
        }
        let isFinalInverse = false;
        if(orders[0] === '-' || orders[0] === -1) {
            isFinalInverse = true;
            orders.shift();
        }
        return chats.sort((y, x) => {
            let result = 0;
            for(let order of orders) {
                if(result !== 0) break;
                if(typeof order === 'function') {
                    result = order(y, x);
                    continue;
                }
                let isInverse = order[0] === '-';
                if(isInverse) order = order.substr(1);
                switch(order) {
                    case 'isSystem':
                    case 'hide':
                    case 'star':
                        result = (x[order] ? 1 : 0) - (y[order] ? 1 : 0);
                        break;
                    case 'online':
                        if(app) {
                            result = (x.isOnline(app) ? 1 : 0) - (y.isOnline(app) ? 1 : 0);
                        }
                        break;
                    default:
                        let xValue, yValue;
                        if(order === 'name' && app) {
                            xValue = x.getDisplayName(app, false);
                            yValue = y.getDisplayName(app, false);
                        } else if(order === 'namePinyin') {
                            xValue = x.getPinYin(app);
                            yValue = y.getPinYin(app);
                        } else {
                            xValue = x[order];
                            yValue = y[order];
                        }
                        if(xValue === undefined || xValue === null) xValue = 0;
                        if(yValue === undefined || yValue === null) yValue = 0;
                        result = xValue > yValue ? 1 : (xValue == yValue ? 0 : -1);
                }
                result *= isInverse ? (-1) : 1;
            }
            return result * (isFinalInverse ? (-1) : 1);
        });
    }
 }

export default Chat;
