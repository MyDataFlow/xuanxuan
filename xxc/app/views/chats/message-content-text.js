import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import replaceViews from '../replace-views';

class MessageContentText extends Component {
    static get MessageContentText() {
        return replaceViews('chats/message-content-text', MessageContentText);
    }

    static propTypes = {
        className: PropTypes.string,
        message: PropTypes.object.isRequired,
        contentConverter: PropTypes.func,
        fontSize: PropTypes.any
    };

    static defaultProps = {
        className: null,
        contentConverter: null,
        fontSize: null
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.className !== this.props.className || nextProps.contentConverter !== this.props.contentConverter || nextProps.message !== this.props.message || nextProps.message.content !== this.props.message.content || nextProps.fontSize !== this.props.fontSize;
    }

    render() {
        const {
            message,
            className,
            contentConverter,
            fontSize,
            ...other
        } = this.props;

        const content = message.renderedTextContent(App.im.ui.renderChatMessageContent, App.im.ui.linkMembersInText);

        return (<div
            {...other}
            className={classes('app-message-content-text markdown-content', className, {
                'is-content-block': message.isBlockContent
            })}
            dangerouslySetInnerHTML={{__html: contentConverter ? contentConverter(content) : content}}
        />);
    }
}

export default MessageContentText;
