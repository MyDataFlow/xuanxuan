import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Modal from '../../components/modal';
import SwapUser from './swap-user';
import Lang from '../../lang';

const show = (identify, onSelectUser, callback) => {
    const modalId = 'app-login-swap-user';
    const onRequestClose= () => {
        Modal.hide(modalId);
    };
    return Modal.show({
        title: Lang.string('login.swapUser'),
        actions: false,
        id: modalId,
        style: {width: 400},
        content: <SwapUser identify={identify} onSelectUser={user => {
            Modal.hide(modalId);
            onSelectUser && onSelectUser(user);
        }}/>
    }, callback);
};

export default {
    show,
};
