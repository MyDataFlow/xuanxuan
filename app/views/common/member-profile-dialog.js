import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Modal from '../../components/modal';
import App from '../../core';
import MemberProfile from './member-profile';

const show = (member, callback) => {
    return Modal.show({
        actions: false,
        id: `member-${member.id}`,
        content: <MemberProfile member={member}/>
    }, callback);
};

export default {
    show,
};
