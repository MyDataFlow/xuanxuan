import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import DraftEditor from '../common/draft-editor';
import Emojione from '../../components/emojione';

class ChatSendbox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sendButtonDisabled: true
        };
    }

    appendImages(images) {
        if(images instanceof FileList) {
            let files = images;
            images = [];
            for(let i = 0; i < files.length; ++i) {
                images.push(files[i]);
            }
        }
        if(!Array.isArray(images)) {
            images = [images];
        }
        images.forEach(image => {
            this.editbox.appendImage(image);
        });
        this.editbox.focus();
    }

    clearContent() {
        this.editbox.clearContent();
        this.setState({sendButtonDisabled: true})
    }

    focusEditor() {
        this.editbox.focus();
    }

    handleSendButtonClick = () => {
        if(this.state.sendButtonDisabled) {
            return;
        }
        this.editbox.getContentList().forEach(content => {
            if(content.type === 'text') {
                content.content = Emojione.toShort(content.content);
                let trimContent = App.profile.userConfig.sendHDEmoticon ? content.content.trim() : false;
                if(trimContent && Emojione.emojioneList[trimContent]) {
                    App.im.ui.sendEmojiMessage(trimContent, this.props.chat);
                } else {
                    App.im.ui.sendTextMessage(content.content, this.props.chat);
                }
            } else if(content.type === 'image') {
                this.handleSelectImageFile(content.image);
            }
        });

        this.clearContent();
        this.focusEditor();
    }

    handleOnChange = (contentState) => {
        this.setState({sendButtonDisabled: !contentState.hasText()});
    }

    handleOnReturnKeyDown = e => {
        if(!e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
            if(!this.state.sendButtonDisabled) {
                setTimeout(() => {
                    this.handleSendButtonClick();
                }, 10);
            }
            e.preventDefault();
            return 'handled';
        }
        return 'not-handled';
    }

    handleSelectImageFile = e => {
        this.appendImages(e.target.files);
    }

    handleOnPaste = e => {
        console.warn('TODO: ChatSendbox.handleOnPaste', e);
        // let imageFile = App.getImageFromClipboard();
        // let imageFileSize = imageFile.getSize();
        // if(imageFileSize && imageFileSize.width * imageFileSize.height > 0) {
        //     let filename = UUID.v4() + '.png';
        //     let filePath = App.user.makeFilePath(filename);
        //     Helper.saveImage(imageFile, filePath).then(image => {
        //         image.width = imageFileSize.width;
        //         image.height = imageFileSize.height;
        //         image.filename = filename;
        //         image.name = filename;
        //         image.type = 'image/png';
        //         this.appendImages(image);
        //     });
        //     e.preventDefault();
        // }
    }

    componentWillUnmount() {
        App.events.off(this.onSendContentToChatHandler);
    }

    componentDidMount() {
        this.onSendContentToChatHandler = App.im.ui.onSendContentToChat(this.props.chat.gid, content => {
            switch(content.type) {
                default:
                    this.editbox.appendContent(content.content);
            }
        });
    }

    render() {
        let {
            chat,
            className,
            style,
            children,
            ...other
        } = this.props;

        const placeholder = '发送消息';

        return <div {...other}
            className={HTML.classes('app-chat-sendbox', className)}
        >
            <DraftEditor className="app-chat-drafteditor dock-top box scroll-y scrollbar-thin"
                ref={e => {this.editbox = e;}}
                placeholder={placeholder}
                onPaste={this.handleOnPaste}
                onChange={this.handleOnChange}
                onReturnKeyDown={this.handleOnReturnKeyDown}
            />
            <div className="dock-bottom app-chat-sendbox-toolbar flex">
                <div className="toolbar flex flex-middle flex-auto">
                {
                    App.im.ui.createSendboxToolbarItems(chat).map(item => {
                        return <div key={item.id} className="hint--top has-padding-sm" data-hint={item.label} onClick={item.click}><button className="btn iconbutton rounded" type="button"><Icon className="" name={item.icon}/></button></div>
                    })
                }
                </div>
                <div className="toolbar flex flex-none flex-middle">
                    <div className="hint--top-left has-padding-sm" data-hint={Lang.string('chat.sendbox.toolbar.send')} onClick={this.handleSendButtonClick}>
                        <button className={HTML.classes('btn iconbutton rounded', {
                            "disabled": this.state.sendButtonDisabled,
                            "text-primary": !this.state.sendButtonDisabled
                        })} type="button"><Icon className="icon-2x" name="keyboard-return"/></button>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default ChatSendbox;
