import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Avatar from '../../components/avatar';
import App from '../../core';
import StringHelper from '../../utils/string-helper';

class MessageBroadcast extends Component {
    static propTypes = {
        className: PropTypes.string,
        prefix: PropTypes.string,
        children: PropTypes.any,
        contentConverter: PropTypes.func,
        message: PropTypes.object.isRequired,
    };

    static defaultProps = {
        className: null,
        prefix: null,
        children: null,
        contentConverter: null,
    };

    render() {
        const {
            message,
            className,
            children,
            prefix,
            contentConverter,
            ...other
        } = this.props;

        let content = message.renderedTextContent(App.im.ui.linkMembersInText, App.im.ui.renderChatMessageContent);

        if (StringHelper.isNotEmpty(prefix)) {
            content = prefix + content;
        }

        return (<div className={HTML.classes('app-message-broadcast has-padding-xs space-sm primary-pale flex-inline flex-middle row single', className)} {...other}>
            <Avatar className="avatar-sm flex-none" icon="bell text-secondary" />
            <div
                className="content markdown-content"
                dangerouslySetInnerHTML={{__html: contentConverter ? contentConverter(content) : content}}
            />
        </div>);
    }
}

export default MessageBroadcast;
