import React from 'react';
import Modal from '../../components/modal';
import {ChatAddCategory} from './chat-add-category';
import Lang from '../../lang';
import App from '../../core';

const show = (chat, callback) => {
    const modalId = 'app-chat-add-category-dialog';
    let chatAddCategory = null;
    return Modal.show({
        id: modalId,
        title: Lang.string('chats.menu.group.add'),
        style: {width: 400},
        content: <ChatAddCategory ref={e => {chatAddCategory = e;}} chat={chat} />,
        onSubmit: () => {
            const category = chatAddCategory.category;
            const oldName = chat.category;
            if (category.name === oldName) {
                return;
            }
            if (category.type === 'create') {
                if (!category.name) {
                    Modal.alert(Lang.string('chats.menu.group.requiredNewName'));
                    return false;
                }
            }
            App.im.server.setChatCategory(chat, category.name);
        }
    }, callback);
};

export default {
    show,
};
