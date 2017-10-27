import React from 'react';
import Modal from './modal';
import timeSequence from '../utils/time-sequence';

const show = (imageSrc, props, callback) => {
    const modalId = `layer-image-viewer-${timeSequence()}`;
    return Modal.show(Object.assign({
        closeButton: true,
        actions: false,
        className: 'layer-image-viewer',
        onClick: () => {
            Modal.hide(modalId);
        },
        content: <img src={imageSrc} alt={imageSrc} />
    }, props, {
        id: modalId
    }), callback);
};

export default {
    show,
};
