import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import App from '../../core';
import replaceViews from '../replace-views';

class MessageContentText extends Component {
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

    static get MessageContentText() {
        return replaceViews('chats/message-content-text', MessageContentText);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.className !== this.props.className || nextProps.contentConverter !== this.props.contentConverter || nextProps.message !== this.props.message || nextProps.message.content !== this.props.message.content || nextProps.fontSize !== this.props.fontSize;
    }

    handleContextMenu = e => {
        if (e.target.tagName === 'A') {
            const link = e.target.href;
            if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
                let linkText = document.getSelection().toString();
                if (linkText === '') {
                    linkText = e.target.innerText;
                }
                App.ui.showContextMenu({x: e.pageX, y: e.pageY}, App.ui.createLinkContextMenu(link, linkText));
                e.preventDefault();
            }
        }
    };

    render() {
        let {
            message,
            className,
            contentConverter,
            fontSize,
            ...other
        } = this.props;

        const content = message.renderedTextContent(App.im.ui.renderChatMessageContent, App.im.ui.linkMembersInText);

        return (<div
            {...other}
            onContextMenu={this.handleContextMenu}
            className={HTML.classes('app-message-content-text markdown-content', className, {
                'is-content-block': message.isBlockContent
            })}
            dangerouslySetInnerHTML={{__html: contentConverter ? contentConverter(content) : content}}
        />);
    }
}

export default MessageContentText;
