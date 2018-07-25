import Config from 'Config';
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import {formatKeyDecoration} from '../../utils/shortcut';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import replaceViews from '../replace-views';
import {getMenuItemsForContext} from '../../core/context-menu';

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

    handleSendBtnContextMenu = e => {
        const currentHotKey = formatKeyDecoration(App.profile.userConfig.sendMessageHotkey);
        let itemsChecked = false;
        const items = [{
            label: Lang.string('chat.sendbox.changeHotkeyTip'),
            disabled: true
        }];
        Config.ui['hotkey.sendMessageOptions'].forEach(x => {
            x = formatKeyDecoration(x);
            if (currentHotKey === x) {
                itemsChecked = true;
            }
            items.push({
                label: x,
                click: () => {
                    App.profile.userConfig.sendMessageHotkey = x;
                },
                checked: currentHotKey === x
            });
        });
        if (!itemsChecked) {
            items.push({
                label: currentHotKey,
                checked: true
            });
        }

        App.ui.showContextMenu({x: e.clientX, y: e.clientY}, items);
    };

    render() {
        const {className, chatGid, sendButtonDisabled, onPreviewButtonClick, onSendButtonClick, userConfigChangeTime, ...other} = this.props;
        return (<div className={classes('app-chat-sendbox-toolbar flex', className)} {...other}>
            <div className="flex flex-middle flex-auto toolbar flex-wrap">
                {
                    getMenuItemsForContext('chat.sendbox.toolbar', {chatGid, openMessagePreview: sendButtonDisabled ? null : onPreviewButtonClick, sendContent: App.im.ui.sendContentToChat}).map((item, idx) => {
                        if (item === 'divider') {
                            return <div key={item.id || idx} className="divider" />;
                        }
                        return <div key={item.id || idx} className="hint--top has-padding-sm" data-hint={item.label} onContextMenu={item.contextMenu} onClick={item.click}><button className={classes('btn iconbutton rounded', item.className)} type="button">{Icon.render(item.icon)}</button></div>;
                    })
                }
            </div>
            <div className="toolbar flex flex-none flex-middle">
                <div className="hint--top-left has-padding-sm" data-hint={`${Lang.string('chat.sendbox.toolbar.send')} (${App.profile.userConfig.sendMessageHotkey} - ${Lang.string('chat.sendbox.toolbar.changeHotkeyTip')})`} onClick={onSendButtonClick}>
                    <button
                        onContextMenu={this.handleSendBtnContextMenu}
                        className={classes('btn iconbutton rounded', {
                            muted: sendButtonDisabled,
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
