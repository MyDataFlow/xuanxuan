import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import App from '../../core';

class MessageContentFileView extends Component {

    render() {
        let {
            message,
            className,
            children,
            ...other
        } = this.props;

        const content = message.renderedTextContent(App.im.ui.linkMembersInText);

        return <div {...other}
            className={HTML.classes('app-message-content-text', className, {
                'is-content-block': message.isBlockContent
            })}
            dangerouslySetInnerHTML={{__html: content}}
        >
        {children}
        </div>;
    }
}

export default MessageContentFileView;
