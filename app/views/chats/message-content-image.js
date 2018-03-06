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
import ImageHolder from '../../components/image-holder';

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
        this.unMounted = true;
    }

    downloadImage(image) {
        if (this.state.download === null) {
            API.downloadFile(App.user, image, progress => {
                if (this.unMounted) return;
                this.setState({download: progress});
            }).then(file => {
                if (this.unMounted) return;
                this.setState({url: image.src, download: true});
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
        const holderProps = {
            width: image.width,
            height: image.height,
            alt: image.name
        };
        if (image.id && image.send === true) {
            const imageUrl = this.state.url;
            if (imageUrl) {
                holderProps.status = 'ok';
                holderProps.onContextMenu = isBrowser ? null : this.handleImageContextMenu.bind(this, imageUrl, '');
                holderProps.source = `file://${image.src}`;
                holderProps.onDoubleClick = ImageViewer.show.bind(this, imageUrl, null, null);
            } else if (typeof this.state.download === 'number') {
                holderProps.status = 'loading';
                holderProps.progress = this.state.download;
            }
        } else if (typeof image.send === 'number') {
            holderProps.status = 'upload';
            holderProps.progress = image.send;
        } else {
            holderProps.status = 'broken';
        }
        return <ImageHolder {...holderProps} />;
    }
}

export default MessageContentImage;
