import React from 'react';
import Modal from '../../components/modal';
import Lang from '../../lang';
import {MessageList} from './message-list';

const show = (messages, props, callback) => {
    const modalId = 'app-messages-preview-dialog';
    return Modal.show(Object.assign({
        id: modalId,
        title: Lang.string('chat.sendbox.toolbar.previewDraft'),
        animation: 'enter-from-bottom',
        style: {
            bottom: 0,
            top: 'auto',
            width: '65%',
            minWidth: 400,
            position: 'absolute'
        },
        actions: false,
        contentClassName: 'box',
        content: <MessageList listItemProps={{ignoreStatus: true}} showDateDivider={false} messages={messages} />
    }, props), callback);
};

export default {
    show,
};
