import Entity from './entity';
import Path   from 'path';

/**
 * Define status names
 */
const USER_STATUS = ['unverified', 'disconnect', 'online', 'busy', 'away'];

/**
 * Define status value code
 */
USER_STATUS.unverified = 0;
USER_STATUS.offline    = 0;
USER_STATUS.disconnect = 1;
USER_STATUS.online     = 2;
USER_STATUS.busy       = 3;
USER_STATUS.away       = 4;

/**
 * Get status name
 */
USER_STATUS.getName = (val, defaultName) => {
    if(val !== undefined && USER_STATUS[val] !== undefined) {
        let typeofStatus = typeof val;
        if(typeofStatus === 'string') {
            return val;
        } else if(typeofStatus === 'number') {
            return USER_STATUS[val];
        }
    }
    return defaultName || USER_STATUS[USER_STATUS.unverified];
};

/**
 * Get status value code
 */
USER_STATUS.getValue = (value, defaultValue) => {
    if(value !== undefined && USER_STATUS[value] !== undefined) {
        let typeofStatus = typeof value;
        if(typeofStatus === 'number') {
            return value;
        } else if(typeofStatus === 'string') {
            return USER_STATUS[value];
        }
    }
    return defaultValue || USER_STATUS.unverified;
}

/**
 * Member class
 */
class Member extends Entity {

    constructor(data) {
        super(data, {dept: 'int'});
    }

    /**
     * Get display name
     * @return {String}
     */
    get displayName() {
        return this.realname ? this.realname : `[${this.account}]`;
    }


    /**
     * Get pinyin str
     * @return {string}
     */
    namePinyin() {
        if(!this.$.pinyin) {
            this.$.pinyin = Helper.pinyin(this.displayName);
        }
        return this.$.pinyin;
    }

    /**
     * Get user status name
     */
    get statusName() {
        return USER_STATUS.getName(this.status);
    }

    /**
     * Get status value
     */
    get statusValue() {
        if(this.status !== undefined && USER_STATUS[this.status] !== undefined) {
            let typeofStatus = typeof this.status;
            if(typeofStatus === 'number') {
                return this.status;
            } else if(typeofStatus === 'string') {
                return USER_STATUS[this.status];
            }
        }
        return USER_STATUS.unverified;
    }

    /**
     * Check user status is online
     * @return {Boolean}
     */
    get isOnline() {
        return this.statusValue >= USER_STATUS.online;
    }

    /**
     * Check user status is disconnect
     */
    get isDisconnect() {
        return this.statusValue === USER_STATUS.disconnect;
    }

    /**
     * Check user status is offline
     * @return {Boolean}
     */
    get isOffline() {
        return !this.isOnline;
    }

    /**
     * Check user status is busy
     * @return {Boolean}
     */
    get isBusy() {
        return this.statusValue === USER_STATUS.busy;
    }

    /**
     * Check user status is unverified
     */
    get isUnverified() {
        return this.statusValue <= USER_STATUS.unverified;
    }

    /**
     * Check user status is disconnect
     */
    get isDisconnect() {
        return this.statusValue === USER_STATUS.disconnect;
    }

    /**
     * Check status
     */
    isStatus(status) {
        return this.status === status || this.statusValue === status || this.statusName === status;
    }

    /**
     * Check the member is current user
     */
    get isMyself() {
        return this.$.isMyself;
    }

    /**
     * Set the member is current user
     */
    set isMyself(isMyself) {
        this.$.isMyself = isMyself;
    }

    /**
     * Check the user is supper admin
     */
    get isSuperAdmin() {
        return this.admin === 'super';
    }

    /**
     * Get local avatar image path
     * @param  {string} imagePath
     * @return {string}
     */
    getLocalAvatar(imagePath) {
        if(this.avatar) {
            return Path.join(imagePath, Path.basename(this.avatar));
        }
        return null;
    }

    /**
     * Sort members
     * @param  {array}         members
     * @param  {array|string}  orders
     * @param  {object}        app    
     * @return {array}
     */
    static sort(members, orders, app) {
        if(!orders || orders === 'default') {
            orders = ['status', 'namePinyin', '-id'];
        } else if(typeof orders === 'string') {
            orders = orders.split(' ');
        }
        const isFinalInverse = false;
        if(orders[0] === '-' || orders[0] === -1) {
            isFinalInverse = true;
            orders.shift();
        }
        return members.sort((y, x) => {
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
                    case 'status':
                        let xStatus = x.statusValue,
                            yStatus = y.statusValue;
                        if(xStatus === USER_STATUS.online) xStatus = 100;
                        if(yStatus === USER_STATUS.online) yStatus = 100;
                        result = xStatus > yStatus ? 1 : (xStatus == yStatus ? 0 : -1);
                        break;
                    default:
                        let xValue = x[order], yValue = y[order];
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

Entity.addCreator({Member});

export {USER_STATUS}
export default Member;
