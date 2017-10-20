import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import App from '../../core';

class MessageContentTextView extends Component {

    render() {
        let {
            message,
            className,
            contentConverter,
            children,
            ...other
        } = this.props;

        const content = message.renderedTextContent(App.im.ui.linkMembersInText);

        return <div {...other}
            className={HTML.classes('app-message-content-text markdown-content', className, {
                'is-content-block': message.isBlockContent
            })}
            dangerouslySetInnerHTML={{__html: contentConverter ? contentConverter(content) : content}}
        ></div>;
    }
}

export default MessageContentTextView;
