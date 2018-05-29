import removeMarkdown from 'remove-markdown';
import Server from '../server';
import Markdown from '../../utils/markdown';

const createTodo = todo => {
    if (!todo.type) {
        todo.type = 'custom';
    }
    if (todo.desc) {
        todo.desc = `${Markdown(todo.desc)}<div class="hidden xxc-todo-source" style="display: none">${todo.desc}</div>`;
    }

    return Server.socket.sendAndListen({
        method: 'upserttodo',
        params: [todo]
    });
};

const createTodoFromMessage = message => {
    const content = message.content;
    const todo = {desc: content};
    const plainContent = removeMarkdown(content);
    const selectedText = document.getSelection().toString();
    let todoName = plainContent;
    if (selectedText && plainContent.includes(selectedText)) {
        todoName = selectedText;
    } else {
        const breakIndex = plainContent.indexOf('\n');
        if (breakIndex > 0) {
            todoName = plainContent.substr(0, breakIndex);
        }
    }
    if (todoName.length > 145) {
        todoName = todoName.sub(0, 144);
    }
    todo.name = todoName;
    return todo;
};

export default {
    createTodo,
    createTodoFromMessage
};
