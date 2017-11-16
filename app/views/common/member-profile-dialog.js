import React from 'react';
import Modal from '../../components/modal';
import App from '../../core';
import {MemberProfile} from './member-profile';

const show = (member, callback) => {
    if (typeof member !== 'object') {
        member = App.members.get(member);
    }
    const modalId = `member-${member.id}`;
    return Modal.show({
        actions: false,
        id: modalId,
        headingClassName: 'dock-right dock-top',
        className: 'app-member-profile-dialog',
        content: <MemberProfile member={member} onRequestClose={() => (Modal.hide(modalId))} />
    }, callback);
};

export default {
    show,
};
