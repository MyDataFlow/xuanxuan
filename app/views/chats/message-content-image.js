import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import Emojione from '../../components/emojione';
import API from '../../network/api';
import Avatar from '../../components/avatar';

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
        }
        if(image.type === 'base64') {
            return <img src={image.content} />;
        }
        if(image.id && image.send === true) {
            return <img src={API.createFileDownloadUrl(App.profile.user, image)}/>;
        }
        if(typeof image.send === 'number') {
            const percent = Math.floor(image.send);
            return <Avatar className="avatar-xl info-pale text-info app-message-image-placeholder" icon="image-area">
                <div className="space-sm"></div>
                <div className="label info circle">{percent}%</div>
            </Avatar>;
        }
        return <Avatar className="avatar-xl warning-pale text-warning app-message-image-placeholder" icon="image-broken-variant">
            <div className="space-xs"></div>
            <div className="label clean circle">{Lang.string('file.uploadFailed')}</div>
        </Avatar>;
    }
}

export default MessageContentImageView;
