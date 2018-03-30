import React from 'react';
import Modal from '../../components/modal';
import TodoEditor from './todo-editer';
import Lang from '../../lang';

const show = (todo, callback) => {
    const modalId = 'app-todo-editor-dialog';
    return Modal.show({
        title: Lang.string(todo.id ? 'todo.edit' : 'todo.create'),
        id: modalId,
        actions: false,
        style: {width: 600},
        content: <TodoEditor defaultTodo={todo} onRequestClose={() => (Modal.hide(modalId))} />
    }, callback);
};

export default {
    show,
};
