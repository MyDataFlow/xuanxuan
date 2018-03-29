import React from 'react';
import Modal from '../../components/modal';
import {ExtensionDetail} from './extension-detail';

const show = (extension, callback) => {
    const modalId = 'app-ext-detail-dialog';
    return Modal.show({
        id: modalId,
        title: null,
        className: 'rounded app-ext-detail-dialog',
        animation: 'enter-from-bottom fade',
        actions: false,
        content: <ExtensionDetail extension={extension} onRequestClose={() => (Modal.hide(modalId))} />
    }, callback);
};

export default {
    show,
};
