import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import App from '../../core';
import Emojione from '../../components/emojione';

class MessageContentImageView extends Component {

    render() {
        let {
            message,
            className,
            children,
            ...other
        } = this.props;

        const image = message.imageContent;

        if(image.type === 'emoji') {
            return <div {...other}
                className={HTML.classes(' emojione-hd', className)}
                dangerouslySetInnerHTML={{__html: Emojione.toImage(image.content)}}
            >
            {children}
            </div>;
        } else if(image.type === 'base64') {
            return <img src={image.content} />;
        }

        return <div {...other}
            className={HTML.classes('app-message-content-text', className, {
                'is-content-block': message.isBlockContent
            })}
            dangerouslySetInnerHTML={{__html: image}}
        >
        {children}
        </div>;
    }
}

export default MessageContentImageView;
