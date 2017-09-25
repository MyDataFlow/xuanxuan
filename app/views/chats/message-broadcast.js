import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import DateHelper from '../../utils/date-helper';
import Lang from '../../lang';
import Avatar from '../../components/avatar';
import App from '../../core';

class MessageBroadcast extends Component {

    render() {
        let {
            message,
            className,
            children,
            prefix,
            ...other
        } = this.props;

        let content = message.renderedTextContent(App.im.ui.linkMembersInText);
        if(prefix !== undefined) {
            content = prefix + content;
        }

        return <div className={HTML.classes('app-message-broadcast has-padding-xs space-sm primary-pale flex-inline flex-middle row single', className)} {...other}>
            <Avatar className="avatar-sm flex-none" icon="bell text-secondary"/>
            <div
                className="content markdown-content"
                dangerouslySetInnerHTML={{__html: content}}
            ></div>
        </div>;
    }
}

export default MessageBroadcast;
