import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import App from '../../core';
import {ChatTitle} from './chat-title';
import replaceViews from '../replace-views';

class ChatHeader extends Component {
    static propTypes = {
        chat: PropTypes.object,
        className: PropTypes.string,
        children: PropTypes.any,
        showSidebarIcon: PropTypes.any,
    };

    static defaultProps = {
        chat: null,
        className: null,
        children: null,
        showSidebarIcon: 'auto'
    };

    static get ChatHeader() {
        return replaceViews('chats/chat-header', ChatHeader);
    }

    render() {
        const {
            chat,
            className,
            children,
            showSidebarIcon,
            ...other
        } = this.props;

        return (<div
            {...other}
            className={HTML.classes('app-chat-header flex flex-wrap space-between shadow-divider', className)}
        >
            <ChatTitle chat={chat} className="flex flex-middle" />
            <div className="toolbar flex flex-middle text-rigth rounded">
                {
                    App.im.ui.createChatToolbarItems(chat, showSidebarIcon).map(item => {
                        return <div key={item.id} className={`hint--${item.hintPosition || 'bottom'} has-padding-sm`} data-hint={item.label} onClick={item.click}><button className={'btn iconbutton rounded' + (item.className ? ` ${item.className}` : '')} type="button"><Icon className="icon-2x" name={item.icon} /></button></div>;
                    })
                }
            </div>
        </div>);
    }
}

export default ChatHeader;
