import Member from './models/member';
import profile from './profile';
import Events from './events';
import Lang from '../lang';

let members = null;
let roles = null;
let depts = null;

const EVENT = {
    change: 'members.change',
};

const update = (memberArr) => {
    if (!Array.isArray(memberArr)) {
        memberArr = [memberArr];
    }

    const newMembers = {};

    memberArr.forEach(member => {
        member = Member.create(member);
        const isMe = profile.user && member.id === profile.user.id;
        member.isMe = isMe;
        newMembers[member.id] = member;
        if (isMe) {
            profile.user.assign({realname: member.realname, avatar: member.avatar});
        }
    });

    Object.assign(members, newMembers);
    Events.emit(EVENT.change, newMembers, members);
    Events.emitDataChange({members: newMembers});
};

const onMembersChange = listener => {
    return Events.on(EVENT.change, listener);
};

const deptsSorter = (d1, d2) => {
    let result = (d1.order || 0) - (d2.order || 0);
    if (result === 0 || Number.isNaN(result)) {
        result = d1.id - d2.id;
    }
    return result;
};
const initDepts = (deptsMap) => {
    depts = {};
    if (deptsMap) {
        const deptsArr = Object.keys(deptsMap).map(deptId => {
            const dept = deptsMap[deptId];
            dept.id = deptId;
            return deptId;
        }).sort(deptsSorter);
        deptsArr.forEach(deptId => {
            const dept = deptsMap[deptId];
            let parentDept = dept.parent && deptsMap[dept.parent];
            if (parentDept) {
                const parents = [];
                if (!parentDept.children) {
                    parentDept.children = [];
                }
                parentDept.children.push(dept);
                while (parentDept) {
                    parents.push(parentDept);
                    parentDept = parentDept.parent && deptsMap[parentDept.parent];
                }
                dept.parents = parents;
            }
            depts[deptId] = dept;
        });
    }
};

const getDeptsTree = () => {
    return Object.keys(depts).map(x => depts[x]).filter(x => !x.parents).sort(deptsSorter);
};

const init = (memberArr, rolesMap, deptsMap) => {
    roles = rolesMap || {};

    Object.keys(members).forEach(membersId => {
        const member = members[membersId];
        if (!member.temp && !member.isDeleted) {
            member.$set('deleted', true);
        }
    });
    if (memberArr && memberArr.length) {
        update(memberArr);
    }

    initDepts(deptsMap);
};

/**
 * Get all members and return an array
 */
const getAll = () => (members ? Object.keys(members).map(x => members[x]) : []);

const forEach = (callback, ignoreDeleteUser = false) => {
    if (members) {
        Object.keys(members).forEach(memberId => {
            if (!ignoreDeleteUser || !members[memberId].isDeleted) {
                callback(members[memberId]);
            }
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
            member.temp = true;
        }
    }
    return member;
};

const guess = (search) => {
    let member = members[search];
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

const getRoleName = role => {
    return (role && roles) ? (roles[role] || Lang.string(`member.role.${role}`, role)) : '';
};

const getDept = deptId => {
    return depts[deptId];
};

profile.onSwapUser(user => {
    members = {};
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
    getRoleName,
    getDept,
    getDeptsTree,
    deptsSorter,
    onMembersChange,
    get map() {
        return members;
    },
    get all() {
        return getAll();
    },
    get depts() {
        return depts;
    },
    get hasDepts() {
        return depts && Object.keys(depts).length;
    }
};
