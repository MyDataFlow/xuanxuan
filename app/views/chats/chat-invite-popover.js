import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Popover from '../../components/popover';
import ChatInvite from './chat-invite';
import Lang from '../../lang';
import App from '../../core';

const show = (position, chat, callback) => {
    const popoverId = 'app-chat-invite-popover';
    const onRequestClose = () => {
        Popover.hide(popoverId);
    };
    return Popover.show(
        position,
        <ChatInvite chat={chat} onRequestClose={onRequestClose}/>,
        {id: popoverId, width: 480, height: 400},
        callback
    );
};

export default {
    show,
};
