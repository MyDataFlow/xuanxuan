import React, {PureComponent, PropTypes} from 'react';
import {classes} from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import replaceViews from '../replace-views';

export default class ChatSendboxToolbar extends PureComponent {
    static get ChatSendboxToolbar() {
        return replaceViews('chats/chat-sendbox-toolbar flex', ChatSendboxToolbar);
    }

    static propTypes = {
        className: PropTypes.string,
        chatGid: PropTypes.string,
        userConfigChangeTime: PropTypes.number,
        sendButtonDisabled: PropTypes.bool,
        onSendButtonClick: PropTypes.func,
        onPreviewButtonClick: PropTypes.func
    };

    static defaultProps = {
        className: null,
        chatGid: null,
        sendButtonDisabled: true,
        onSendButtonClick: null,
        onPreviewButtonClick: null,
        userConfigChangeTime: null,
    };


    render() {
        const {className, chatGid, sendButtonDisabled, onPreviewButtonClick, onSendButtonClick, userConfigChangeTime, ...other} = this.props;
        return (<div className={classes('app-chat-sendbox-toolbar flex', className)} {...other}>
            <div className="flex flex-middle flex-auto toolbar">
                {
                    App.im.ui.createSendboxToolbarItems(chatGid, sendButtonDisabled ? null : onPreviewButtonClick).map(item => <div key={item.id} className="hint--top has-padding-sm" data-hint={item.label} onContextMenu={item.contextMenu} onClick={item.click}><button className={classes('btn iconbutton rounded', item.className)} type="button">{Icon.render(item.icon)}</button></div>)
                }
            </div>
            <div className="toolbar flex flex-none flex-middle">
                <div className="hint--top-left has-padding-sm" data-hint={`${Lang.string('chat.sendbox.toolbar.send')} (Enter)`} onClick={onSendButtonClick}>
                    <button
                        className={classes('btn iconbutton rounded', {
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
