import members from '../members';
import Lang from '../../lang';
import Member from '../models/member';
import Events from '../events';

const chatLogin = (msg, socket) => {
    if (msg.isSuccess) {
        const user = socket.user;
        if (user.isLogging || msg.data.id === user.id) {
            user.$set(msg.data);
            return true;
        }
        const member = members.get(msg.data.id);
        if (member) {
            member.status = msg.data.status;
            members.update(member);
        }
    }
    return false;
};

const chatLogout = (msg, socket) => {
    if (msg.isSuccess) {
        const user = socket.user;
        if (msg.data.id === user.id && socket.isConnecting) {
            user.markUnverified();
            socket.close();
        } else {
            const member = members.get(msg.data.id);
            if (member) {
                member.status = Member.STATUS.unverified;
                members.update(member);
            }
        }
    }
};

const chatError = (msg, socket) => {
    const message = Lang.error(msg);
    if (message) {
        Events.emit('ui.message', message);
    }
};

const chatSettings = (msg, socket) => {
    if (msg.isSuccess) {
        const user = socket.user;
        if (msg.data && msg.data.lastSaveTime > user.config.lastSaveTime && user.config.hash !== msg.data.hash) {
            user.config.reset(msg.data);
        }
    }
};

const chatUserchangestatus = (msg, socket) => {
    if (msg.isSuccess) {
        const user = socket.user;
        if (!msg.data.id || msg.data.id === user.id) {
            user.status = msg.data.status;
        }

        if (msg.data.id) {
            const member = members.get(msg.data.id);
            if (member) {
                member.status = msg.data.status;
                members.update(member);
            }
        }
    }
};

const chatUserchange = (msg, socket) => {
    if (msg.isSuccess && msg.data) {
        const user = socket.user;
        if (!msg.data.id || msg.data.id === user.id) {
            user.$set(msg.data);
            if (msg.data.status) {
                user.status = msg.data.status;
            }
        }

        if (msg.data.id) {
            const member = members.get(msg.data.id);
            if (member) {
                member.$set(msg.data);
                if (msg.data.status) {
                    member.status = msg.data.status;
                }
                members.update(member);
                return member;
            }
        }
    }
};

const chatKickoff = (msg, socket) => {
    socket.close(null, 'KICKOFF');
};

const chatUsergetlist = (msg, socket) => {
    if (msg.isSuccess) {
        if (msg.partial) {
            members.update(msg.data);
        } else {
            members.init(msg.data, msg.roles, msg.depts);
        }
    }
};

const chatSessionID = (msg, socket) => {
    if (msg.isSuccess || msg.sessionID) {
        const user = socket.user;
        user.sessionID = msg.data || msg.sessionID;
    }
};


export default {
    'chat/login': chatLogin,
    'chat/logout': chatLogout,
    'chat/error': chatError,
    'chat/settings': chatSettings,
    'chat/userchangestatus': chatUserchangestatus,
    'chat/userchange': chatUserchange,
    'chat/kickoff': chatKickoff,
    'chat/usergetlist': chatUsergetlist,
    'chat/sessionid': chatSessionID,
};
