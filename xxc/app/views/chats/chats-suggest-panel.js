import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Config from 'Config';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import replaceViews from '../replace-views';
import FileData from '../../core/models/file-data';
import ImageHolder from '../../components/image-holder';
import Button from '../../components/button';
import Lang from '../../lang';
import ClickOutsideWrapper from '../../components/click-outside-wrapper';

export default class ChatsSuggestPanel extends PureComponent {
    static get ChatsSuggestPanel() {
        return replaceViews('chats/chats-suggest-panel', ChatsSuggestPanel);
    }

    static propTypes = {
        className: PropTypes.string,
    };

    static defaultProps = {
        className: null,
    };

    constructor(props) {
        super(props);
        this.state = {image: null, show: false};
    }

    componentDidMount() {
        this.suggestSendImageHandler = App.im.ui.onSuggestSendImage(image => {
            this.showSuggestPanel(image);
        });
    }

    componentWillUnmount() {
        App.events.off(this.suggestSendImageHandler);
        if (this.showSuggestPanelTimer) {
            clearTimeout(this.showSuggestPanelTimer);
            this.showSuggestPanelTimer = null;
        }
    }

    showSuggestPanel(image) {
        this.setState({image: FileData.create(image), show: true}, () => {
            if (this.showSuggestPanelTimer) {
                clearTimeout(this.showSuggestPanelTimer);
            }
            this.showSuggestPanelTimer = setTimeout(() => {
                this.setState({show: false});
                this.showSuggestPanelTimer = null;
            }, Config.ui['chat.suggestPanelShowTime'] || 10000);
        });
    }

    handleCloseBtnClick = () => {
        if (this.state.show) {
            if (this.showSuggestPanelTimer) {
                clearTimeout(this.showSuggestPanelTimer);
                this.showSuggestPanelTimer = null;
            }
            this.setState({show: false});
        }
    };

    handleSendBtnClick = () => {
        if (this.state.image) {
            App.im.server.sendImageMessage(this.state.image, App.im.ui.currentActiveChat);
        }
        this.handleCloseBtnClick();
    };

    render() {
        const {className} = this.props;
        const {image, show} = this.state;

        let imageView = null;
        if (image) {
            imageView = (<ImageHolder source={image.viewUrl}>
                <div className="toolbar dock dock-bottom has-padding text-center">
                    <Button icon="message-image" className="green rounded" label={Lang.string('chat.sendClipboardImage')} onClick={this.handleSendBtnClick} />&nbsp; &nbsp;
                    <Button icon="close" className="blue rounded" label={Lang.string('common.close')} onClick={this.handleCloseBtnClick} />
                </div>
            </ImageHolder>);
        }

        return (<ClickOutsideWrapper onClickOutside={this.handleCloseBtnClick} className={classes('dock dock-right dock-bottom layer app-chats-suggest-panel rounded has-pading scale-from-bottom shadow-3', className, {in: show})}>{imageView}</ClickOutsideWrapper>);
    }
}
