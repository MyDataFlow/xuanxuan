import Entity from '../entity';
import UUID   from 'uuid';
import Helper from 'Helper';

const CHAT_TYPES = {
    'one2one': {},
    'group': {},
    'project': {},
    'product': {}
};

const MAX_MESSAGE_COUNT = 30;

/**
 * Chat class
 */
class Chat extends Entity {
    constructor(data) {
        super(data);

        this.id;
        this.type;
        this.gid;
        this.name;
        this.createdBy;
        this.createdDate;
        this.members;
        this.messages;
    }

    /**
     * Initial function return an object for init and convert attribute values
     * @return {object}
     */
    _initValuesConverter() {
        return {
            createdDate: 'timestamp',
            lastActiveTime: 'timestamp',
            'public': 'bool',
            'hide': 'bool',
            star: 'bool',
            mute: 'bool',
            admins: 'intSet',
            $global: data => {
                if(Array.isArray(data.members)) {
                    data.members = new Set(data.members);
                } else if(typeof(data.members) === 'object' && data.members.size === undefined) {
                    data.members = new Set(Object.keys(data.members).map(x => parseInt(data.members[x].id)));
                }

                if(!data.type) {
                    if(data.members && data.members.size === 2 && (!data.gid || data.gid.indexOf('&') > -1)) {
                        data.type = 'one2one';
                    } else {
                        data.type = 'group';
                    }
                }

                if(!data.gid) {
                    if(data.type === 'one2one') {
                        data.gid = Array.from(data.members).sort().join('&');
                    } else {
                        data.gid = UUID.v4();
                    }
                }
            }
        };
    }

    /**
     * Initial function to generate id attribute
     * @return {string}
     */
    _generateId() {
        this._id = this.typeName + '/' + this.gid;
        return this._id;
    }

    /**
     * Get display name
     * @param  {App} app
     * @return {string}
     */
    getDisplayName(app, includeMemberCount = true) {
        if(this.isOne2One) {
            let otherOne = this.getTheOtherOne(app.user);
            return otherOne ? otherOne.displayName : app.lang.chat.tempChat;
        } else if(this.type === 'system') {
            return includeMemberCount ? app.lang.chat.groupNameFormat.format(this.name || app.lang.chat.systemGroup, app.lang.chat.allMembers) : (this.name || app.lang.chat.systemGroup);
        } else if(this.name !== undefined && this.name !== '') {
            return includeMemberCount ? app.lang.chat.groupNameFormat.format(this.name, this.membersCount) : this.name;
        } else {
            return app.lang.chat.chatGroup + (this.id || (' (' + app.lang.chat.tempChat + ')'));
        }
    }

    /**
     * Get pinyin str
     * @param  {object} app
     * @return {string}
     */
    getPinYin(app) {
        if(!this.$.pinyin) {
            let str = app ? this.getDisplayName(app, false) : this.name;
            this.$.pinyin = Helper.pinyin(str);
        }
        return this.$.pinyin;
    }

    /**
     * Check the chat contacs is online
     */
    isOnline(app) {
        if(this.isOne2One) {
            let otherOne = this.getTheOtherOne(app.user);
            if(!otherOne) {
                if(DEBUG) console.error('Can not get the other member of the chat', {chat: this, user: app.user});
                return false;
            }
            return otherOne.isOnline;
        }
        return true;
    }

    /**
     * Get members count
     */
    get membersCount() {
        return this.members ? this.members.size : 0;
    }

    /**
     * Is member
     * @param  {number|object}  member
     * @return {Boolean}
     */
    isMember(member) {
        return this.members && this.members.has((typeof member === 'object') ? member.id : member);
    }

    /**
     * Try to get the other member
     * @param  {Member} current user, me
     * @return {Member | null}
     */
    getTheOtherOne(user) {
        if(this.isOne2One) {
            if(!this.$.theOtherOne) {
                this.$.theOtherOne = this.membersSet.find(member => member.id !== user.id);
            }
            return this.$.theOtherOne;
        }
        return null;
    }

    /**
     * Check the user whether is the chat owner
     * @param  {Member}  user
     * @return {boolean}
     */
    isOwner(user) {
        return user.id === this.createdBy || user.account === this.createdBy;
    }

    /**
     * Check the chat type whether is 'one2one'
     * @return {boolean}
     */
    get isOne2One() {
        return this.type === 'one2one';
    }

    /**
     * Check the chat can add more members
     * @return {boolean}
     */
    get canJoin() {
        return this.public && this.type === 'group';
    }

    /**
     * Check whether the chat type is 'system'
     * @return {boolean}
     */
    get isSystem() {
        return this.type === 'system';
    }

    get isGroup() {
        return this.type === 'group';
    }

    /**
     * Check the chat type is system or group
     * @return {Boolean}
     */
    get isGroupOrSystem() {
        return this.type === 'system' || this.type === 'group';
    }

    /**
     * Check the chat whether can turn public status by the given user
     * @param  {User | Member} user
     * @return {boolean}
     */
    canMakePublic(user) {
        return this.isAdmin(user) &&  this.type === 'group';
    }

    /**
     * Check whether the chat can invite more members
     * @return {boolean}
     */
    canInvite(user) {
        return this.isCommitter(user) && (this.type === 'one2one' || this.type === 'group');
    }

    /**
     * Check whether member of chat can exit it
     * @return {boolean}
     */
    get canExit() {
        return this.type === 'group';
    }

    /**
     * Get notice count
     * @return {number}
     */
    get noticeCount() {
        return this.$.noticeCount || 0;
    }

    /**
     * Check whether the chat can change name
     * @return {booean}
     */
    canRename(user) {
        return this.isCommitter(user) && this.type !== 'one2one';
    }

    /**
     * Check the current user is whether can set the chat committers
     */
    canSetCommitters(user) {
        return this.isAdmin(user) && this.type !== 'one2one';
    }

    /**
     * Get committers type
     */
    get committersType() {
        if((this.isSystem || this.isGroup) && this.committers && this.committers !== '$ALL') {
            if(this.committers === '$ADMINS') {
                return 'admins';
            }
            return 'whitelist';
        }
        return 'all';
    }

    /**
     * Check whether has whitelist setting
     */
    get hasWhitelist() {
        return this.committersType === 'whitelist';
    }

    /**
     * Get whitelist
     */
    get whitelist() {
        if(this.hasWhitelist) {
            let set = new Set();
            this.committers.split(',').forEach(x => {
                x = Number.parseInt(x);
                if(x !== NaN) {
                    set.add(x);
                }
            });
            return set;
        }
        return null;
    }

    /**
     * Set whitelist
     */
    set whitelist(value) {
        if(!this.isSystem && !this.isGroup) {
            value = '';
        }
        let valType = typeof value;
        if(value instanceof Set) {
            value = Array.from(value);
        }
        if(Array.isArray(value)) {
            value = value.join(',');
        }
        this.committers = value;
    }

    /**
     * Check a member whether is in whitelist
     */
    isInWhitelist(member, whitelist) {
        if(typeof member === 'object') {
            member = member.remoteId;
        }
        whitelist = whitelist || this.whitelist;
        if(whitelist) {
            return whitelist.has(member);
        }
        return false;
    }

    /**
     * Add member to whitelist
     */
    addToWhitelist(member) {
        let whitelist = this.whitelist;
        if(whitelist) {
            if(typeof member === 'object') {
                member = member.remoteId;
            }
            if(!whitelist.has(member)) {
                whitelist.add(member);
                this.whitelist = whitelist;
                return true;
            }
        }
        return false;
    }

    /**
     * Remove user from whitelist
     */
    removeFromWhitelist(member) {
        let whitelist = this.whitelist;
        if(whitelist) {
            if(typeof member === 'object') {
                member = member.remoteId;
            }
            if(whitelist.has(member)) {
                whitelist.delete(member);
                this.whitelist = whitelist;
                return true;
            }
        }
        return false;
    }

    /**
     * Check a member whether is committer
     */
    isCommitter(member) {
        switch(this.committersType) {
            case 'admins':
                return this.isAdmin(member);
            case 'whitelist':
                if(typeof member === 'object') {
                    member = member.remoteId;
                }
                return this.isInWhitelist(member);
        }
        return true;
    }

    /**
     * Check a member whether can only read the chat
     */
    isReadonly(member) {
        return !this.isCommitter(member);
    }

    /**
     * Check whether the chat is a new chat
     * @return {boolean}
     */
    get isNewChat() {
        if(this.createdDate) {
            return ((new Date()).getTime() - this.createdDate) < 3600000;
        }
        return false;
    }

    /**
     * Set notice count
     * @param  {number} count
     * @return {void}
     */
    set noticeCount(count) {
        this.$.noticeCount = count;
    }

    /**
     * Get chat members as set
     * @return {Set<Member>}
     */
    get membersSet() {
        return this.$.members || this.members;
    }

    /**
     * Set chat members in set
     * @param  {Set<Member>} members
     * @return {void}
     */
    set membersSet(members) {
        this.$.members = members;
        this._updateMembersFromSet();
    }

    /**
     * Get chat messages as Array
     * @return {[Message]}
     */
    get messages() {
        return this.$.messages;
    }

    /**
     * Set chat messages in array
     * @param  {[Message]} messages
     * @return {void}
     */
    set messages(messages) {
        this.$.messages = messages;
    }

    /**
     * Add a member as 
     */
    addAdmin(member) {
        if(!this.admins) {
            this.admins = new Set();
        }
        this.admins.add(typeof member === 'object' ? member.remoteId : member);
    }

    /**
     * Check a member whether is administrator
     */
    isAdmin(member) {
        if(typeof member !== 'object') {
            member = {remoteId: member, account: member};
        }
        if(this.isSystem && member.isSuperAdmin) {
            return true;
        }
        if(this.createdBy === member.account) {
            return true;
        }
        if(this.admins) {
            return this.admins.has(member.remoteId) || this.admins.has(member.account);
        }
        return false;
    }

    /**
     * Update members information with the DAO object
     * @param  {DAO} dao
     * @return {void}
     */
    updateMembersSet(app) {
        this.$.members = app.$dao.getMembers(Array.isArray(this.members) ? this.members : Array.from(this.members));
    }

    /**
     * Update active time
     */
    updateActiveTime(app) {
        if(!this.lastActiveTime) {
            this.lastActiveTime = this.createdDate;
            app.dao.getChatMessages().then(messages => {
                let maxTime = 0, lastMessage;
                messages.forEach(function(message) {
                    if(message.date > maxTime) {
                        lastMessage = message;
                        maxTime = message.date;
                    }
                });
                if(maxTime) {
                    this.addMessage(lastMessage);
                }
            });
        }
    }

    /**
     * Update chat information with dao
     */
    updateWithApp(app) {
        this.updateMembersSet(app);
        this.updateActiveTime(app);
    }

    /**
     * Update and store members ids in a set
     * @return {void}
     */
    _updateMembersFromSet() {
        this.members = new Set(this.$.members.map(x => x.id));
    }

    /**
     * Add member
     * @param {Member} member
     */
    addMember(...members) {
        if(!this.$.members) this.$.members = [];
        this.$.members.push(...members);
        this._updateMembersFromSet();
    }

    /**
     * Add message
     * @param {ChatMessage} message
     */
    addMessage(...messages) {
        if(!this.$.messages) this.$.messages = [];
        let size = this.$.messages.length;
        let firstMessage = size > 0 ? this.$.messages[0] : null;
        let hasNewMessage = false;
        messages.forEach(message => {
            if(size >= MAX_MESSAGE_COUNT && firstMessage.date >= message.date && firstMessage.gid !== message.gid) return;

            let checkMessage = this.$.messages.find(x => x.gid === message.gid);
            if(checkMessage) {
                message.updateTime = new Date();
                checkMessage.assign(message);
            } else {
                this.$.messages.push(message);
                hasNewMessage = true;
            }

            if(!this.lastActiveTime || this.lastActiveTime < message.date) {
                this.lastActiveTime = message.date;
            }
        });

        if(hasNewMessage) {
            this.$.messages.sort((x, y) => {
                let orderResult = x.date - y.date;
                if(orderResult === 0) {
                    orderResult = (x.remoteId || Number.MAX_SAFE_INTEGER) - (y.remoteId || Number.MAX_SAFE_INTEGER);
                }
                if(orderResult === 0) {
                    orderResult = x.order - y.order;
                }
                return orderResult;
            });
            size = this.$.messages.length;
            if(size > MAX_MESSAGE_COUNT) {
                this.$.messagesOverflow = true;
                this.$.messages.splice(0, size - MAX_MESSAGE_COUNT);
            }
        }
    }

    /**
     * Delete local message
     */
    removeMessage(message, onlyLocal = true) {
        if(this.$.messages && this.$.messages.length) {
            if(typeof message === 'object') {
                message = message.gid;
            }
            let findIndex = this.$.messages.findIndex(x => {
                return (!onlyLocal || !x.remoteId) && x.gid === message;
            });
            if(findIndex > -1) {
                this.$.messages.splice(findIndex, 1);
            }
        }
        return false;
    }

    /**
     * Get all chat types
     */
    static TYPES() {
        return CHAT_TYPES;
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
        const isFinalInverse = false;
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

Entity.addCreator({Chat});

export default Chat;
