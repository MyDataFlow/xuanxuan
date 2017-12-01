import React, {Component, PropTypes} from 'react';
import Platform from 'Platform';
import HTML from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import API from '../../network/api';
import Emojione from '../../components/emojione';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import ImageViewer from '../../components/image-viewer';
import replaceViews from '../replace-views';

const isBrowser = Platform.type === 'browser';

class MessageContentImage extends Component {
    static propTypes = {
        className: PropTypes.string,
        message: PropTypes.object.isRequired,
    };

    static defaultProps = {
        className: null,
    };

    static get MessageContentImage() {
        return replaceViews('chats/message-content-image', MessageContentImage);
    }

    constructor(props) {
        super(props);
        this.state = {
            download: null,
            url: ''
        };
        if (isBrowser) {
            const {message} = this.props;
            const image = message.imageContent;
            this.state.url = API.createFileDownloadUrl(App.user, image);
        }
    }

    componentDidMount() {
        const {message} = this.props;
        const image = message.imageContent;
        if (!this.state.url && image.id && image.send === true) {
            this.downloadImage(image);
        }
    }
    componentDidUpdate() {
        this.componentDidMount();
    }

    componentWillUnmount() {
        this.mounted = true;
    }

    downloadImage(image) {
        if (this.state.download === null) {
            API.downloadFile(App.user, image, progress => {
                if (this.mounted) return;
                this.setState({download: progress});
            }).then(file => {
                if (this.mounted) return;
                this.setState({url: image.src, download: true});
            }).catch(error => {
                if (this.mounted) return;
                this.setState({download: false});
            });
        }
    }

    handleImageContextMenu(url, dataType, e) {
        const items = App.ui.createImageContextMenuItems(url, dataType);
        App.ui.showContextMenu({x: e.pageX, y: e.pageY}, items);
        e.preventDefault();
    }

    render() {
        const {
            message,
            className,
            ...other
        } = this.props;

        const image = message.imageContent;

        if (image.type === 'emoji') {
            return (<div
                {...other}
                className={HTML.classes(' emojione-hd', className)}
                dangerouslySetInnerHTML={{__html: Emojione.toImage(image.content)}}
            />);
        }
        if (image.type === 'base64') {
            return (<img
                onContextMenu={isBrowser ? null : this.handleImageContextMenu.bind(this, image.content, image.type)}
                data-fail={Lang.string('file.downloadFailed')}
                onError={e => e.target.classList.add('broken')}
                onDoubleClick={ImageViewer.show.bind(this, image.content, null, null)}
                src={image.content}
                alt={image.type}
            />);
        }
        if (image.id && image.send === true) {
            const imageUrl = this.state.url;
            if (imageUrl) {
                return (<img
                    onContextMenu={isBrowser ? null : this.handleImageContextMenu.bind(this, imageUrl, '')}
                    title={image.name}
                    alt={image.name}
                    data-fail={Lang.string('file.downloadFailed')}
                    onError={e => e.target.classList.add('broken')}
                    onDoubleClick={ImageViewer.show.bind(this, imageUrl, null, null)}
                    src={imageUrl}
                />);
            } else if (typeof this.state.download === 'number') {
                const percent = Math.floor(this.state.download);
                return (<Avatar
                    className="avatar-xl info-pale text-info app-message-image-placeholder"
                    icon="image-area"
                >
                    <div className="space-sm" />
                    <div className="label info circle"><Icon name="download" /> {percent}%</div>
                </Avatar>);
            }
        }
        if (typeof image.send === 'number') {
            const percent = Math.floor(image.send);
            return (<Avatar className="avatar-xl info-pale text-info app-message-image-placeholder" icon="image-area">
                <div className="space-sm" />
                <div className="label info circle"><Icon name="upload" /> {percent}%</div>
            </Avatar>);
        }

        return (<Avatar className="avatar-xl warning-pale text-warning app-message-image-placeholder" icon="image-broken">
            <div className="space-xs" />
            {image.send === false ? <div className="label clean circle">{Lang.string('file.uploadFailed')}</div> : null}
        </Avatar>);
    }
}

export default MessageContentImage;
