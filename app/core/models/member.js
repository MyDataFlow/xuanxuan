import Entity from './entity';
import Pinyin from '../../utils/pinyin';
import Status from '../../utils/status';

const STATUS = new Status({
    unverified: 0,    // 未登录
    loginFailed: 1,   // 登录失败
    waitReconnect: 2, // 等待重连
    logining: 3,      // 正在登录
    reconnecting: 4,  // 正在重连
    disconnect: 5,    // 登录过，但掉线了
    logined: 6,       // 登录成功
    online: 7,        // 在线
    busy: 8,          // 忙碌
    away: 9,          // 离开
}, 0);

class Member extends Entity {

    static NAME = 'Member';
    static STATUS = STATUS;
    static SCHEMA = Entity.SCHEMA.extend({
        account: {type: 'string', unique: true},
        email: {type: 'string', indexed: true},
        phone: {type: 'string', indexed: true},
        realname: {type: 'string', indexed: true},
    });

    constructor(data, entityType = Member.NAME) {
        super(data, entityType);
        this._status = STATUS.create(this.$.status);
    }

    get schema() {
        return Member.SCHEMA;
    }

    // Member status

    get status() {
        return this._status.value;
    }

    get statusName() {
        return this._status.name;
    }

    set status(newStatus) {
        this._status.change(newStatus);
    }

    get isOnline() {
        return this.status >= STATUS.logined;
    }

    get isOffline() {
        return !this.isOnline;
    }

    isStatus(status) {
        return this._status.is(status);
    }

    // Name or account

    isMember(account) {
        return this.account === account;
    }

    get isSuperAdmin() {
        return this.admin === 'super';
    }

    get realname() {
        return this.$get('realname');
    }

    get account() {
        return this.$get('account');
    }

    get displayName() {
        let name = this.$get('realname', `[${this.account}]`);
        if(!name) {
            name = `User-${this.id}`;
        }
        return name;
    }

    get namePinyin() {
        if(!this._namePinyin) {
            this._namePinyin = Pinyin(this.displayName);
        }
        return this._namePinyin;
    }


    // Static methods

    static create(member) {
        if(member instanceof Member) {
            return member;
        }
        return new Member(member);
    }

    /**
     * Sort members
     * @param  {array}         members
     * @param  {array|string}  orders
     * @param  {object}        app
     * @return {array}
     */
    static sort(members, orders, userMe) {
        if(members.length < 2) {
            return members;
        }
        if(typeof orders === 'function') {
            return members.sort(orders);
        }
        if(!orders || orders === 'default' || orders === true) {
            orders = ['me', 'status', '-namePinyin', '-id'];
        } else if(typeof orders === 'string') {
            orders = orders.split(' ');
        }
        let isFinalInverse = false;
        if(orders[0] === '-' || orders[0] === -1) {
            isFinalInverse = true;
            orders.shift();
        }
        const userMeId = (typeof userMe === 'object') ? userMe.id : userMe;
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
                    case 'me':
                        if(userMe) {
                            if(userMeId === x.id) result = 1;
                            else if(userMeId === y.id) result = -1;
                        }
                        break;
                    case 'status':
                        let xStatus = x.status,
                            yStatus = y.status;
                        if(xStatus === STATUS.online) xStatus = 100;
                        if(yStatus === STATUS.online) yStatus = 100;
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

export {STATUS};
export default Member;
