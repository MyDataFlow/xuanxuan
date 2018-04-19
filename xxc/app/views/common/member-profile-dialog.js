import React from 'react';
import Modal from '../../components/modal';
import App from '../../core';
import {MemberProfile} from './member-profile';

const show = (memberId, callback) => {
    if (typeof memberId === 'object') {
        memberId = memberId.id;
    }
    const modalId = `member-${memberId}`;
    return Modal.show({
        actions: false,
        id: modalId,
        headingClassName: 'dock-right dock-top',
        className: 'app-member-profile-dialog',
        content: <MemberProfile memberId={memberId} onRequestClose={() => (Modal.hide(modalId))} />
    }, callback);
};

export default {
    show,
};
