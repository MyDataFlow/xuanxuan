import React from 'react';
import Popover from '../../components/popover';
import ChatInvite from './chat-invite';

const show = (position, chat, callback) => {
    const popoverId = 'app-chat-invite-popover';
    const onRequestClose = () => {
        Popover.hide(popoverId);
    };
    return Popover.show(
        position,
        <ChatInvite chat={chat} onRequestClose={onRequestClose} />,
        {id: popoverId, width: 490, height: 400},
        callback
    );
};

export default {
    show,
};
