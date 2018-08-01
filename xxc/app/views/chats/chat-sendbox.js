import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import {getKeyDecoration} from '../../utils/shortcut';
import Emojione from '../../components/emojione';
import Lang from '../../lang';
import App from '../../core';
import {DraftEditor} from '../common/draft-editor';
import {ChatSendboxToolbar} from './chat-sendbox-toolbar';
import MessagesPreivewDialog from './messages-preview-dialog';
import replaceViews from '../replace-views';

export default class ChatSendbox extends Component {
    static get ChatSendbox() {
        return replaceViews('chats/chat-sendbox', ChatSendbox);
    }

    static propTypes = {
        className: PropTypes.string,
        chat: PropTypes.object,
    };

    static defaultProps = {
        className: null,
        chat: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            sendButtonDisabled: true
        };
    }

    componentDidMount() {
        this.onSendContentToChatHandler = App.im.ui.onSendContentToChat(this.props.chat.gid, content => {
            if (content && content.content) {
                switch (content.type) {
                case 'image':
                    this.editbox.appendImage(content.content);
                    break;
                default:
                    this.editbox.appendContent(content.content);
                }
            }
            this.editbox.focus();
        });
    }

    componentWillUnmount() {
        App.events.off(this.onSendContentToChatHandler);
    }

    appendImages(images) {
        if (images instanceof FileList) {
            const files = images;
            images = [];
            for (let i = 0; i < files.length; ++i) {
                images.push(files[i]);
            }
        }
        if (!Array.isArray(images)) {
            images = [images];
        }
        images.forEach(image => {
            this.editbox.appendImage(image);
        });
        this.editbox.focus();
    }

    clearContent() {
        this.editbox.clearContent();
        this.setState({sendButtonDisabled: true});
    }

    focusEditor() {
        this.editbox.focus();
    }

    handleSendButtonClick = async () => {
        if (this.state.sendButtonDisabled) {
            return;
        }

        const contentList = this.editbox.getContentList();
        this.clearContent();
        this.focusEditor();
        for (let i = 0; i < contentList.length; ++i) {
            const content = contentList[i];
            if (content.type === 'text') {
                content.content = Emojione.toShort(content.content);
                const trimContent = App.profile.userConfig.sendHDEmoticon ? content.content.trim() : false;
                if (trimContent && Emojione.emojioneList[trimContent]) {
                    await App.im.server.sendEmojiMessage(trimContent, this.props.chat); // eslint-disable-line
                } else {
                    await App.im.server.sendTextMessage(content.content, this.props.chat); // eslint-disable-line
                }
            } else if (content.type === 'image') {
                await App.im.server.sendImageMessage(content.image, this.props.chat); // eslint-disable-line
            }
        }
    }

    handleOnChange = (contentState) => {
        this.setState({sendButtonDisabled: !contentState.hasText()});
    }

    handleOnReturnKeyDown = e => {
        const keyDecoration = getKeyDecoration(e);
        if (keyDecoration === App.profile.userConfig.sendMessageHotkey) {
            if (!this.state.sendButtonDisabled) {
                setTimeout(() => {
                    this.handleSendButtonClick();
                }, 10);
            }
            e.preventDefault();
            return 'handled';
        }
        return 'not-handled';
    }

    handlePreviewBtnClick = e => {
        if (this.state.sendButtonDisabled) {
            return;
        }

        const messages = [];
        const {chat} = this.props;
        this.editbox.getContentList().forEach(content => {
            if (content.type === 'text') {
                content.content = Emojione.toShort(content.content);
                const trimContent = App.profile.userConfig.sendHDEmoticon ? content.content.trim() : false;
                if (trimContent && Emojione.emojioneList[trimContent]) {
                    messages.push(App.im.server.createEmojiChatMessage(trimContent, chat));
                } else {
                    messages.push(App.im.server.createTextChatMessage(content.content, chat));
                }
            } else if (content.type === 'image') {
                messages.push(App.im.server.createTextChatMessage(`![preview-image](${content.image.url || content.image.path})`, chat));
            }
        });
        MessagesPreivewDialog.show(messages, {onHidden: () => {
            this.editbox.focus();
        }});
    };

    handleOnFocus = e => {
        App.im.ui.emitChatSendboxFocus(this.props.chat, this.editbox.getContent());
    };

    render() {
        const {
            chat,
            className,
            ...other
        } = this.props;

        let placeholder = null;
        if (chat.isOne2One) {
            const theOtherOne = chat.getTheOtherOne(App);
            if (theOtherOne && theOtherOne.isOffline) {
                placeholder = Lang.format('chat.sendbox.placeholder.memberIsOffline', theOtherOne.displayName);
            }
        }
        placeholder = placeholder || `${Lang.string('chat.sendbox.placeholder.sendMessage')}${App.profile.userConfig.sendMarkdown ? ' (Markdown)' : ''}`;
        const {userConfig} = App.profile;

        return (<div
            {...other}
            className={classes('app-chat-sendbox', className)}
        >
            <DraftEditor
                className="app-chat-drafteditor white dock-top has-padding scroll-y"
                ref={e => {this.editbox = e;}}
                placeholder={placeholder}
                onChange={this.handleOnChange}
                onReturnKeyDown={this.handleOnReturnKeyDown}
                onFocus={this.handleOnFocus}
            />
            <ChatSendboxToolbar className="dock-bottom" chatGid={chat.gid} userConfigChangeTime={userConfig && userConfig.lastChangeTime} sendButtonDisabled={this.state.sendButtonDisabled} onSendButtonClick={this.handleSendButtonClick} onPreviewButtonClick={this.handlePreviewBtnClick} />
        </div>);
    }
}
