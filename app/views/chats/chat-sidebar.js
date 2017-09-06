import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';

class ChatSidebar extends Component {

    render() {
        let {
            chat,
            className,
            style,
            children,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-chat-sidebar')}
        >
            ChatSidebar
        </div>;
    }
}

export default ChatSidebar;
