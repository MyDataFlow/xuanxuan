import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import Icon from '../../components/icon';
import App from '../../core';
import {ChatTitle} from './chat-title';
import replaceViews from '../replace-views';
import {getMenuItemsForContext} from '../../core/context-menu';

class ChatHeader extends Component {
    static get ChatHeader() {
        return replaceViews('chats/chat-header', ChatHeader);
    }

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

    shouldComponentUpdate(nextProps) {
        const {chat} = nextProps;
        return (this.props.className !== nextProps.className ||
            this.props.children !== nextProps.children ||
            this.props.chat !== nextProps.chat || this.lastChatUpdateId !== nextProps.chat.updateId ||
            (nextProps.chat.isOne2One && nextProps.chat.getTheOtherOne(App).updateId !== this.lastOtherOneUpdateId) ||
            this.isSidebarHidden !== App.profile.userConfig.isChatSidebarHidden(chat.gid, chat.isOne2One)
        );
    }

    render() {
        const {
            chat,
            className,
            children,
            showSidebarIcon,
            ...other
        } = this.props;

        this.lastChatUpdateId = chat.updateId;
        if (chat.isOne2One) {
            this.lastOtherOneUpdateId = chat.getTheOtherOne(App).updateId;
        }
        this.isSidebarHidden = App.profile.userConfig.isChatSidebarHidden(chat.gid, chat.isOne2One);

        return (<div
            {...other}
            className={classes('app-chat-header flex flex-wrap space-between shadow-divider', className)}
        >
            <ChatTitle chat={chat} className="flex flex-middle" />
            <div className="toolbar flex flex-middle text-rigth rounded">
                {
                    getMenuItemsForContext('chat.toolbar', {chat, showSidebarIcon}).map(item => {
                        return <div key={item.id} className={`hint--${item.hintPosition || 'bottom'} has-padding-sm`} data-hint={item.label} onClick={item.click}><button className={`btn iconbutton rounded${item.className ? ` ${item.className}` : ''}`} type="button"><Icon className="icon-2x" name={item.icon} /></button></div>;
                    })
                }
            </div>
        </div>);
    }
}

export default ChatHeader;
