import Member from './models/member';
import profile from './profile';
import Events from './events';

let members = null;

const update = (memberArr) => {
    if (!Array.isArray(memberArr)) {
        memberArr = [memberArr];
    }

    const newMembers = {};

    memberArr.forEach(member => {
        member = Member.create(member);
        member.isMe = profile.user && member.id === profile.user.id;
        newMembers[member.id] = member;
    });

    Object.assign(members, newMembers);
    Events.emitDataChange({members: newMembers});
};

const init = (memberArr) => {
    members = {};
    if (memberArr && memberArr.length) {
        update(memberArr);
    }
};

/**
 * Get all members and return an array
 */
const getAll = () => (members ? Object.keys(members).map(x => members[x]) : []);

const forEach = (callback) => {
    if (members) {
        Object.keys(members).forEach(memberId => {
            callback(members[memberId]);
        });
    }
};

/**
 * Get member by given id or account
 *
 * @param {string} idOrAccount
 */
const get = (idOrAccount) => {
    let member = members[idOrAccount];
    if (!member) {
        const findId = Object.keys(members).find(x => (members[x].account === idOrAccount));
        if (findId) member = members[findId];
        else {
            member = new Member({
                id: idOrAccount,
                account: idOrAccount,
                realname: `User-${idOrAccount}`
            });
        }
    }
    return member;
};

const guess = (search) => {
    let member = get(search);
    if (!member) {
        const findId = Object.keys(members).find(x => {
            const xMember = members[x];
            return xMember.account === search || xMember.realname === search;
        });
        if (findId) {
            member = members[findId];
        }
    }
    return member;
};

const query = (condition, sortList) => {
    let result = null;
    if (typeof condition === 'object' && condition !== null) {
        const conditionObj = condition;
        const conditionKeys = Object.keys(conditionObj);
        condition = member => {
            for (const key of conditionKeys) {
                if (conditionObj[key] !== member[key]) {
                    return false;
                }
            }
            return true;
        };
    }
    if (typeof condition === 'function') {
        result = [];
        forEach(member => {
            if (condition(member)) {
                result.push(member);
            }
        });
    } else if (Array.isArray(condition)) {
        result = [];
        condition.forEach(x => {
            const member = get(x);
            if (member) {
                result.push(member);
            }
        });
    } else {
        result = getAll();
    }
    if (sortList && result && result.length) {
        Member.sort(result, sortList, profile.user && profile.user.id);
    }
    return result || [];
};

const remove = member => {
    const memberId = (typeof member === 'object') ? member.id : member;
    if (members[memberId]) {
        delete members[memberId];
        return true;
    }
    return false;
};

profile.onSwapUser(user => {
    init();
});

export default {
    update,
    init,
    get,
    getAll,
    forEach,
    guess,
    query,
    remove,
    get map() {
        return members;
    },
    get all() {
        return getAll();
    }
};
