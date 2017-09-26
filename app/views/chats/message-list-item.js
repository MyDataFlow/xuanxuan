import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import DateHelper from '../../utils/date-helper';
import MessageDivider from './message-divider';
import UserAvatar from '../common/user-avatar';
import App from '../../core';
import MessageContentFile from './message-content-file';
import MessageContentImage from './message-content-image';
import MessageContentText from './message-content-text';
import MemberProfileDialog from '../common/member-profile-dialog';
import ContextMenu from '../../components/context-menu';
import Icon from '../../components/icon';
import MessageBroadcast from './message-broadcast';

const showTimeLabelInterval = 1000*60*5;

class MessageListItem extends Component {

    static defaultProps = {
        lastMessage: null,
        showDateDivider: 0,
        hideHeader: 0,
    };

    handleSenderNameClick(sender, message) {
        App.im.ui.sendContentToChat(`@${sender.displayName} `);
    }

    handleUserContextMenu(sender, e) {
        const items = App.im.ui.createChatMemberContextMenuItems(sender);
        ContextMenu.show({x: e.pageX, y: e.pageY}, items);
    }

    checkResendMessage() {
        const {message} = this.props;
        if(message.needCheckResend) {
            clearTimeout(this.checkResendTask);
            this.checkResendTask = setTimeout(() => {
                if(message.needResend) {
                    this.forceUpdate();
                }
            }, 10500)
        }
    }

    componentDidUpdate() {
        if(!this.props.ignoreStatus) {
            this.checkResendMessage();
        }
    }

    componentDidMount() {
        if(!this.props.ignoreStatus) {
            this.checkResendMessage();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.checkResendTask);
    }

    handleResendBtnClick = e => {
        const message = this.props.message;
        message.date = new Date().getTime();
        if(message.needCheckResend) {
            App.im.server.sendChatMessage(message);
        }
        this.forceUpdate();
    }

    handleDeleteBtnClick = e => {
        const message = this.props.message;
        if(message.needCheckResend) {
            App.im.chats.deleteLocalMessage(this.props.message);
        }
    }

    render() {
        let {
            message,
            lastMessage,
            showDateDivider,
            hideHeader,
            ignoreStatus,
            font,
            className,
            children,
            ...other
        } = this.props;

        const needCheckResend = !ignoreStatus && message.needCheckResend;
        const needResend = !ignoreStatus && needCheckResend && message.needResend;

        if(showDateDivider === 0) {
            showDateDivider = !lastMessage || !DateHelper.isSameDay(message.date, lastMessage.date);
        }
        if(hideHeader === 0) {
            hideHeader = !showDateDivider && lastMessage && lastMessage.senderId === message.senderId;
        }

        let headerView = null;
        let timeLabelView = null;
        let contentView = null;
        let resendButtonsView = null;

        const basicFontStyle = font ? {
            fontSize: font.size + 'px',
            lineHeight: font.lineHeight,
        } : null;
        const titleFontStyle = font ? {
            fontSize: font.title + 'px',
            lineHeight: font.titleLineHeight,
        } : null;

        if(!hideHeader) {
            const sender = message.getSender(App.members);
            headerView = <div className="app-message-item-header">
                <UserAvatar className="state" user={sender} onContextMenu={this.handleUserContextMenu.bind(this, sender)} onClick={MemberProfileDialog.show.bind(null, sender, null)}/>
                <header style={titleFontStyle}>
                    <a className="title rounded text-primary" onContextMenu={this.handleUserContextMenu.bind(this, sender)} onClick={this.handleSenderNameClick.bind(this, sender, message)}>{sender.displayName}</a>
                    <small className="time">{DateHelper.formatDate(message.date, 'hh:mm')}</small>
                </header>
            </div>;
        }

        if(message.isBroadcast) {
            contentView = <MessageBroadcast style={basicFontStyle} message={message}/>
        } else if(message.isFileContent) {
            contentView = <MessageContentFile message={message}/>;
        } else if(message.isImageContent) {
            contentView = <MessageContentImage message={message}/>;
        } else {
            contentView = <MessageContentText style={basicFontStyle} message={message}/>;
        }

        if(!headerView) {
            let hideTimeLabel = false;
            if(hideHeader && !showDateDivider && lastMessage && message.date && (message.date - lastMessage.date) <= showTimeLabelInterval) {
                hideTimeLabel = true;
            }
            timeLabelView = <span className={HTML.classes('app-message-item-time-label', {'as-dot': hideTimeLabel})}>{DateHelper.formatDate(message.date, 'hh:mm')}</span>;
        }

        if(!ignoreStatus && needResend) {
            resendButtonsView = <nav className="nav nav-sm app-message-item-actions">
                <a onClick={this.handleResendBtnClick}><Icon name="refresh"/> {Lang.string('chat.message.resend')}</a>
                <a onClick={this.handleDeleteBtnClick}><Icon name="delete"/> {Lang.string('common.delete')}</a>
            </nav>
        }

        return <div {...other}
            className={HTML.classes('app-message-item', className, {
                'app-message-sending': !ignoreStatus && needCheckResend && !needResend,
                'app-message-send-fail': !ignoreStatus && needResend,
                'with-avatar': !hideHeader
            })}
        >
            {showDateDivider && <MessageDivider date={message.date}/>}
            {headerView}
            {timeLabelView}
            {contentView && <div className="app-message-content">{contentView}</div>}
            {resendButtonsView}
        </div>;
    }
}

export default MessageListItem;
