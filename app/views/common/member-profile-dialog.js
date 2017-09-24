import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Modal from '../../components/modal';
import App from '../../core';
import MemberProfile from './member-profile';

const show = (member, callback) => {
    if(typeof member !== 'object') {
        member = App.members.get(member);
    }
    const modalId = `member-${member.id}`;
    return Modal.show({
        actions: false,
        id: modalId,
        content: <MemberProfile member={member} onRequestClose={() => {
            Modal.hide(modalId);
        }}/>
    }, callback);
};

export default {
    show,
};
