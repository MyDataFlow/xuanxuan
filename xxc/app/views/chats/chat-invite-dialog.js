import React from 'react';
import Modal from '../../components/modal';
// import {ChatInvite} from './chat-invite';
import {ChatInvite} from './chat-invite';
import Lang from '../../lang';
import HTML from '../../utils/html-helper';

const show = (chat, callback) => {
    const modalId = 'app-chat-invite-dialog';
    const onRequestClose = () => {
        Modal.hide(modalId);
    };
    return Modal.show({
        id: modalId,
        className: 'app-chat-invite-dialog',
        title: Lang.string('chat.invite.title'),
        content: <ChatInvite chat={chat} onRequestClose={onRequestClose} />,
        actions: false,
    }, callback);
};

export default {
    show,
};
