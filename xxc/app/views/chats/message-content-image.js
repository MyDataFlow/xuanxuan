import React, {Component} from 'react';
import PropTypes from 'prop-types'; // eslint-disable-line
import Platform from 'Platform';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import Emojione from '../../components/emojione';
import ImageViewer from '../../components/image-viewer';
import replaceViews from '../replace-views';
import ImageHolder from '../../components/image-holder';
import FileData from '../../core/models/file-data';
import {showContextMenu} from '../../core/context-menu';

const isBrowser = Platform.type === 'browser';

class MessageContentImage extends Component {
    static get MessageContentImage() {
        return replaceViews('chats/message-content-image', MessageContentImage);
    }

    static propTypes = {
        className: PropTypes.string,
        message: PropTypes.object.isRequired,
    };

    static defaultProps = {
        className: null,
    };

    constructor(props) {
        super(props);
        const {message} = this.props;
        this.state = {
            download: null,
            url: message.attachFile ? message.attachFile.viewUrl : ''
        };
    }

    componentDidMount() {
        const {message} = this.props;
        const image = message.imageContent;
        if (!this.state.url && image.id && image.send === true) {
            this.downloadImage(image);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.className !== this.props.className || nextProps.message !== this.props.message || nextProps.message.updateId !== this.lastMessageUpdateId || nextState.download !== this.state.download || nextState.url || this.state.url;
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
                this.setState({url: isBrowser ? file.url : `file://${file.localPath}`, download: true});
            }).catch(error => {
                if (this.unMounted) return;
                this.setState({download: false});
            });
        }
    }

    handleImageContextMenu = event => {
        if (isBrowser) return;
        showContextMenu('image', {
            event,
            url: this.state.url || this.imageUrl,
            dataType: this.imageType
        });
    };

    handleEmojiContextMenu = event => {
        if (isBrowser) return;
        const image = this.props.message.imageContent;
        showContextMenu('emoji', {event, emoji: Emojione.shortnameToUnicode(image.content)});
    };

    handleImageDoubleClick = () => {
        ImageViewer.show(this.state.url || this.imageUrl, null, null);
    };

    render() {
        const {
            message,
            className,
            ...other
        } = this.props;

        this.lastMessageUpdateId = message.updateId;
        let image = message.imageContent;

        if (image.type === 'emoji') {
            return (<div
                {...other}
                onContextMenu={this.handleEmojiContextMenu}
                className={classes(' emojione-hd', className)}
                dangerouslySetInnerHTML={{__html: Emojione.toImage(image.content)}}
            />);
        }
        if (image.type === 'base64') {
            this.imageUrl = image.content;
            this.imageType = image.type;
            return (<img
                onContextMenu={this.handleImageContextMenu}
                data-fail={Lang.string('file.downloadFailed')}
                onError={e => e.target.classList.add('broken')}
                onDoubleClick={this.handleImageDoubleClick}
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
                holderProps.onContextMenu = this.handleImageContextMenu;
                holderProps.source = imageUrl;
                holderProps.onDoubleClick = this.handleImageDoubleClick;
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
