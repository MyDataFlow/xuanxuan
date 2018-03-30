import React from 'react';
import Modal from '../../components/modal';
import {SwapUser} from './swap-user';
import Lang from '../../lang';

const show = (identify, onSelectUser, callback) => {
    const modalId = 'app-login-swap-user';
    return Modal.show({
        title: Lang.string('login.swapUser'),
        actions: false,
        id: modalId,
        style: {width: 400},
        content: <SwapUser
            identify={identify}
            onSelectUser={user => {
                Modal.hide(modalId);
                if (onSelectUser) {
                    onSelectUser(user);
                }
            }}
        />
    }, callback);
};

export default {
    show,
};
