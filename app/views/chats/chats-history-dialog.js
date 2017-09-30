import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Modal from '../../components/modal';
import ChatsHistory from './chats-history';
import Lang from '../../lang';
import App from '../../core';

const show = (chat, callback) => {
    const modalId = 'app-chats-history-dialog';
    return Modal.show({
        id: modalId,
        style: {
            left: 10,
            right: 10,
            bottom: 0,
            top: 10
        },
        className: 'app-chats-history-dialog dock primary-pale',
        animation: 'enter-from-bottom',
        actions: false,
        content: <ChatsHistory chat={chat}/>
    }, callback);
};

export default {
    show,
};
