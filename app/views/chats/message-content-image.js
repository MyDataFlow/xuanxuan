import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import Emojione from '../../components/emojione';
import API from '../../network/api';
import Avatar from '../../components/avatar';
import ImageViewer from '../../components/image-viewer';

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
            return <img data-fail={Lang.string('file.downloadFailed')} onError={e => e.target.classList.add('broken')} onDoubleClick={ImageViewer.show.bind(this, image.content, null, null)} src={image.content} />;
        }
        if(image.id && image.send === true) {
            const imageUrl = API.createFileDownloadUrl(App.profile.user, image);
            return <img title={imageUrl} data-fail={Lang.string('file.downloadFailed')} onError={e => e.target.classList.add('broken')} onDoubleClick={ImageViewer.show.bind(this, imageUrl, null, null)} src={imageUrl}/>;
        }
        if(typeof image.send === 'number') {
            const percent = Math.floor(image.send);
            return <Avatar className="avatar-xl info-pale text-info app-message-image-placeholder" icon="image-area">
                <div className="space-sm"></div>
                <div className="label info circle">{percent}%</div>
            </Avatar>;
        }
        return <Avatar className="avatar-xl warning-pale text-warning app-message-image-placeholder" icon="image-broken">
            <div className="space-xs"></div>
            <div className="label clean circle">{Lang.string('file.uploadFailed')}</div>
        </Avatar>;
    }
}

export default MessageContentImageView;
