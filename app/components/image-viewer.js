import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Modal from './modal';
import timeSequence from '../utils/time-sequence';

const show = (imageSrc, props, callback) => {
    const modalId = 'layer-image-viewer-' + timeSequence();
    return Modal.show(Object.assign({
        closeButton: true,
        actions: false,
        className: 'layer-image-viewer',
        onClick: e => {
            Modal.hide(modalId);
        },
        content: <img src={imageSrc}/>
    }, props, {
        id: modalId
    }), callback);
};

export default {
    show,
};
