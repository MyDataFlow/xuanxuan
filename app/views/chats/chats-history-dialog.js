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
        title: Lang.string('chats.history.title'),
        style: {
            left: 10,
            right: 10,
            bottom: 0,
            top: 10
        },
        className: 'dock primary-pale',
        actions: false,
        content: <ChatsHistory chat={chat}/>
    }, callback);
};

export default {
    show,
};
