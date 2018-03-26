import React, {PureComponent, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import replaceViews from '../replace-views';

export default class ChatSendboxToolbar extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        chatGid: PropTypes.string,
        showMessageTip: PropTypes.bool,
        captureScreenHotkey: PropTypes.string,
        sendButtonDisabled: PropTypes.bool,
        onSendButtonClick: PropTypes.func,
        onPreviewButtonClick: PropTypes.func
    };

    static defaultProps = {
        className: null,
        chatGid: null,
        showMessageTip: true,
        captureScreenHotkey: null,
        sendButtonDisabled: true,
        onSendButtonClick: null,
        onPreviewButtonClick: null
    };

    static get ChatSendboxToolbar() {
        return replaceViews('chats/chat-sendbox-toolbar flex', ChatSendboxToolbar);
    }

    render() {
        const {className, chatGid, showMessageTip, captureScreenHotkey, sendButtonDisabled, onPreviewButtonClick, onSendButtonClick, ...other} = this.props;
        return (<div className={HTML.classes('app-chat-sendbox-toolbar flex', className)} {...other}>
            <div className="flex flex-middle flex-auto toolbar">
                {
                    App.im.ui.createSendboxToolbarItems(chatGid, showMessageTip, captureScreenHotkey).map(item => <div key={item.id} className="hint--top has-padding-sm" data-hint={item.label} onContextMenu={item.contextMenu} onClick={item.click}><button className="btn iconbutton rounded" type="button"><Icon name={item.icon} /></button></div>)
                }
                <div className="hint--top has-padding-sm" data-hint={Lang.string('chat.sendbox.toolbar.previewDraft')} onClick={onPreviewButtonClick}><button disabled={sendButtonDisabled} className="btn iconbutton rounded" type="button"><Icon name="file-document-box" /></button></div>
            </div>
            <div className="toolbar flex flex-none flex-middle">
                <div className="hint--top-left has-padding-sm" data-hint={`${Lang.string('chat.sendbox.toolbar.send')} (Enter)`} onClick={onSendButtonClick}>
                    <button
                        className={HTML.classes('btn iconbutton rounded', {
                            disabled: sendButtonDisabled,
                            'text-primary': !sendButtonDisabled
                        })}
                        type="button"
                    >
                        <Icon className="icon-2x" name="keyboard-return" />
                    </button>
                </div>
            </div>
        </div>);
    }
}
