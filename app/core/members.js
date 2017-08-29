import Member from '../models/member';
import Platform from 'Platform';
import profile from './user-profile';
import Events from './events';

let members = null;

const update = (...memberArr) => {
    let newMembers = {};

    memberArr.forEach(member => {
        member = Member.create(member);
        member.isMe = member.id === userMeId;
        newMembers[member.id] = member;
    });
    Object.assign(members, newMembers);
    Events.emitDataChange({members: newMembers});
};

const init = (memberArr) => {
    members = {};
    if(memberArr && memberArr.length) {
        update(memberArr);
    }
};

const get = (idOrAccount) => {
    let member = members[idOrAccount];
    if(!member) {
        let findId = Object.keys(members).find(x => {
            return members[x].account === idOrAccount;
        });
        if(findId) member = members[findId]
        else {
            member = new Member({
                id: idOrAccount,
                account: idOrAccount,
                realname: '用户-' + idOrAccount
            });
        }
    }
    return member;
};

const guess = (search) => {
    let member = get(search);
    if(!member) {
        let findId = Object.keys(members).find(x => {
            const xMember = members[x];
            return xMember.account === search || xMember.realname === search;
        });
        if(findId) member = members[findId]
    }
    return member;
};

const query = (condition, sortList) => {
    let result = null;
    if(typeof condition === 'function') {
        result = [];
        Object.keys(members).forEach(x => {
            let member = members[x];
            if(condition(member)) {
                result.push(member);
            }
        });
    } else if(Array.isArray(condition)) {
        result = [];
        condition.forEach(x => {
            let member = this.getMember(x);
            if(member) {
                result.push(member);
            }
        });
    } else {
        result = Object.keys(members).map(x => members[x]);
    }
    if(sortList && result && result.length) {
        Member.sort(result, sortList, userMeId);
    }
    return result || [];
};

const remove = member => {
    const memberId = (typeof member === 'object') ? member.id : member;
    if(members[memberId]) {
        delete members[memberId];
        return true;
    } else {
        return false;
    }
};

const removeAll = () => {
    members = null;
    userMeId = null;
};

export default {
    update,
    init,
    get,
    guess,
    query,
    remove,
    removeAll,
    get all() {
        return members;
    }
};
