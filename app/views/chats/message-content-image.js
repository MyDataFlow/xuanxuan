import React, {Component, PropTypes} from 'react'; // eslint-disable-line
import Platform from 'Platform';
import HTML from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import Emojione from '../../components/emojione';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import ImageViewer from '../../components/image-viewer';
import replaceViews from '../replace-views';
import ImageHolder from '../../components/image-holder';
import FileData from '../../core/models/file-data';

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
        const {message} = this.props;
        this.state = {
            download: null,
            url: message.attachFile ? message.attachFile.viewUrl : ''
        };
        if (isBrowser) {
            const image = message.imageContent;
            if (image.type !== 'emoji' && image.type !== 'base64') {
                this.state.url = FileData.create(image).makeUrl(App.user);
            }
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
        this.unMounted = true;
    }

    downloadImage(image) {
        if (this.state.download === null) {
            App.im.files.downloadFile(image, progress => {
                if (this.unMounted) return;
                this.setState({download: progress});
            }).then(file => {
                if (this.unMounted) return;
                this.setState({url: isBrowser ? file.src : `file://${file.localPath}`, download: true});
            }).catch(error => {
                if (this.unMounted) return;
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

        let image = message.imageContent;

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
        const holderProps = {
            width: image.width,
            height: image.height,
            alt: image.name
        };
        image = FileData.create(image);

        if (image.isOK) {
            const imageUrl = this.state.url;
            if (imageUrl) {
                holderProps.status = 'ok';
                holderProps.onContextMenu = isBrowser ? null : this.handleImageContextMenu.bind(this, imageUrl, '');
                holderProps.source = imageUrl;
                holderProps.onDoubleClick = ImageViewer.show.bind(this, imageUrl, null, null);
            } else {
                holderProps.status = 'loading';
                holderProps.progress = typeof this.state.download === 'number' ? this.state.download : 0;
                holderProps.loadingText = Lang.string('file.loading');
                if (!message.isSender(App.user.id)) {
                    holderProps.progress = 50 + (holderProps.progress / 2);
                }
            }
        } else if (typeof image.send === 'number') {
            holderProps.status = 'loading';
            holderProps.progress = image.send;
            holderProps.previewUrl = this.state.url;
            if (!message.isSender(App.user.id)) {
                holderProps.loadingText = Lang.string('file.loading');
                holderProps.progress /= 2;
            } else {
                holderProps.loadingText = Lang.string('file.sending');
            }
        } else {
            holderProps.status = 'broken';
        }

        return <ImageHolder {...holderProps} />;
    }
}

export default MessageContentImage;
