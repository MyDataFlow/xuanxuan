import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import Avatar from '../../components/avatar';
import App from '../../core';
import StringHelper from '../../utils/string-helper';
import replaceViews from '../replace-views';

class MessageBroadcast extends Component {
    static get MessageBroadcast() {
        return replaceViews('chats/message-broadcast', MessageBroadcast);
    }

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

    shouldComponentUpdate(nextProps) {
        return nextProps.className !== this.props.className || nextProps.message !== this.props.message || nextProps.message.content !== this.props.message.content;
    }

    render() {
        const {
            message,
            className,
            children,
            prefix,
            contentConverter,
            ...other
        } = this.props;

        let content = message.renderedTextContent(content => {
            return content.replace(/我/g, `@${message.getSender(App.members).account}${content.substr(1)}`);
        }, App.im.ui.renderChatMessageContent, App.im.ui.linkMembersInText);

        if (StringHelper.isNotEmpty(prefix)) {
            content = prefix + content;
        }

        return (<div className={classes('app-message-broadcast has-padding-xs space-sm primary-pale flex-inline flex-middle row single', className)} {...other}>
            <Avatar className="avatar-sm flex-none" icon="bell text-secondary" />
            <div
                className="content markdown-content"
                dangerouslySetInnerHTML={{__html: contentConverter ? contentConverter(content) : content}}
            />
        </div>);
    }
}

export default MessageBroadcast;
