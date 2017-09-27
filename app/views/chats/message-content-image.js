import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import Emojione from '../../components/emojione';
import Icon from '../../components/icon';
import API from '../../network/api';
import Avatar from '../../components/avatar';
import ImageViewer from '../../components/image-viewer';

class MessageContentImageView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            download: 0,
            url: ''
        };
    }

    downloadImage(image) {
        API.downloadFile(App.user, image, progress => {
            this.setState({download: progress});
        }).then(file => {
            this.setState({url: image.src});
            this.setState({download: true});
        }).catch(error => {
            this.setState({download: false});
        });
    }

    componentDidMount() {
        const {message} = this.props;
        const image = message.imageContent;
        if(image.id && image.send === true) {
            this.downloadImage(image);
        }
    }

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
            if(this.state.url) {
                return <img title={image.name} data-fail={Lang.string('file.downloadFailed')} onError={e => e.target.classList.add('broken')} onDoubleClick={ImageViewer.show.bind(this, this.state.url, null, null)} src={this.state.url}/>;
            } else {
                if(typeof this.state.download === 'number') {
                    const percent = Math.floor(this.state.download);
                    return <Avatar className="avatar-xl info-pale text-info app-message-image-placeholder" icon="image-area">
                        <div className="space-sm"></div>
                        <div className="label info circle"><Icon name="download"/> {percent}%</div>
                    </Avatar>;
                }
            }
        }
        if(typeof image.send === 'number') {
            const percent = Math.floor(image.send);
            return <Avatar className="avatar-xl info-pale text-info app-message-image-placeholder" icon="image-area">
                <div className="space-sm"></div>
                <div className="label info circle"><Icon name="upload"/> {percent}%</div>
            </Avatar>;
        }
        return <Avatar className="avatar-xl warning-pale text-warning app-message-image-placeholder" icon="image-broken">
            <div className="space-xs"></div>
            <div className="label clean circle">{Lang.string('file.uploadFailed')}</div>
        </Avatar>;
    }
}

export default MessageContentImageView;
