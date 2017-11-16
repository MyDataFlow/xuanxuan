import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import DateHelper from '../../utils/date-helper';
import App from '../../core';
import Lang from '../../lang';
import ContextMenu from '../../components/context-menu';
import Icon from '../../components/icon';
import MemberProfileDialog from '../common/member-profile-dialog';
import {UserAvatar} from '../common/user-avatar';
import {MessageDivider} from './message-divider';
import {MessageContentFile} from './message-content-file';
import {MessageContentImage} from './message-content-image';
import {MessageContentText} from './message-content-text';
import {MessageBroadcast} from './message-broadcast';
import replaceViews from '../replace-views';

const showTimeLabelInterval = 1000 * 60 * 5;

class MessageListItem extends Component {
    static propTypes = {
        message: PropTypes.object.isRequired,
        lastMessage: PropTypes.object,
        font: PropTypes.object,
        ignoreStatus: PropTypes.bool,
        showDateDivider: PropTypes.any,
        hideHeader: PropTypes.any,
        staticUI: PropTypes.bool,
        avatarSize: PropTypes.number,
        dateFormater: PropTypes.string,
        textContentConverter: PropTypes.func,
        className: PropTypes.string,
        children: PropTypes.any,
    };

    static defaultProps = {
        lastMessage: null,
        children: null,
        font: null,
        className: null,
        showDateDivider: 0,
        hideHeader: 0,
        staticUI: false,
        avatarSize: null,
        dateFormater: 'hh:mm',
        ignoreStatus: false,
        textContentConverter: null,
    };

    static get MessageListItem() {
        return replaceViews('chats/message-list-item', MessageListItem);
    }

    componentDidMount() {
        if (!this.props.ignoreStatus) {
            this.checkResendMessage();
        }
    }

    componentDidUpdate() {
        if (!this.props.ignoreStatus) {
            this.checkResendMessage();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.checkResendTask);
    }

    handleSenderNameClick(sender, message) {
        App.im.ui.sendContentToChat(`@${sender.displayName} `);
    }

    handleUserContextMenu(sender, e) {
        const items = App.im.ui.createChatMemberContextMenuItems(sender);
        ContextMenu.show({x: e.pageX, y: e.pageY}, items);
        e.preventDefault();
    }

    checkResendMessage() {
        const {message} = this.props;
        if (message.needCheckResend) {
            clearTimeout(this.checkResendTask);
            this.checkResendTask = setTimeout(() => {
                if (message.needResend) {
                    this.forceUpdate();
                }
            }, 10500);
        }
    }


    handleResendBtnClick = e => {
        const message = this.props.message;
        message.date = new Date().getTime();
        if (message.needCheckResend) {
            App.im.server.sendChatMessage(message);
        }
        this.forceUpdate();
    }

    handleDeleteBtnClick = e => {
        const message = this.props.message;
        if (message.needCheckResend) {
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
            dateFormater,
            textContentConverter,
            avatarSize,
            children,
            staticUI,
            ...other
        } = this.props;

        const needCheckResend = !ignoreStatus && message.needCheckResend;
        const needResend = !ignoreStatus && needCheckResend && message.needResend;

        if (showDateDivider === 0) {
            showDateDivider = !lastMessage || !DateHelper.isSameDay(message.date, lastMessage.date);
        }
        if (hideHeader === 0) {
            hideHeader = !showDateDivider && lastMessage && lastMessage.senderId === message.senderId;
        }

        let headerView = null;
        let timeLabelView = null;
        let contentView = null;
        let resendButtonsView = null;

        const basicFontStyle = font ? {
            fontSize: `${font.size}px`,
            lineHeight: font.lineHeight,
        } : null;
        const titleFontStyle = font ? {
            fontSize: `${font.title}px`,
            lineHeight: font.titleLineHeight,
        } : null;

        if (!hideHeader) {
            const sender = message.getSender(App.members);
            headerView = (<div className="app-message-item-header">
                <UserAvatar size={avatarSize} className="state" user={sender} onContextMenu={this.handleUserContextMenu.bind(this, sender)} onClick={MemberProfileDialog.show.bind(null, sender, null)} />
                <header style={titleFontStyle}>
                    <a className="title rounded text-primary" onContextMenu={staticUI ? null : this.handleUserContextMenu.bind(this, sender)} onClick={staticUI ? MemberProfileDialog.show.bind(null, sender, null) : this.handleSenderNameClick.bind(this, sender, message)}>{sender.displayName}</a>
                    <small className="time">{DateHelper.formatDate(message.date, dateFormater)}</small>
                </header>
            </div>);
        }

        if (message.isBroadcast) {
            contentView = <MessageBroadcast contentConverter={textContentConverter} style={basicFontStyle} message={message} />;
        } else if (message.isFileContent) {
            contentView = <MessageContentFile message={message} />;
        } else if (message.isImageContent) {
            contentView = <MessageContentImage message={message} />;
        } else {
            contentView = <MessageContentText contentConverter={textContentConverter} style={basicFontStyle} message={message} />;
        }

        if (!headerView) {
            let hideTimeLabel = false;
            if (hideHeader && !showDateDivider && lastMessage && message.date && (message.date - lastMessage.date) <= showTimeLabelInterval) {
                hideTimeLabel = true;
            }
            timeLabelView = <span className={HTML.classes('app-message-item-time-label', {'as-dot': hideTimeLabel})}>{DateHelper.formatDate(message.date, 'hh:mm')}</span>;
        }

        if (!staticUI && !ignoreStatus && needResend) {
            resendButtonsView = (<nav className="nav nav-sm app-message-item-actions">
                <a onClick={this.handleResendBtnClick}><Icon name="refresh" /> {Lang.string('chat.message.resend')}</a>
                <a onClick={this.handleDeleteBtnClick}><Icon name="delete" /> {Lang.string('common.delete')}</a>
            </nav>);
        }

        return (<div
            {...other}
            className={HTML.classes('app-message-item', className, {
                'app-message-sending': !ignoreStatus && needCheckResend && !needResend,
                'app-message-send-fail': !ignoreStatus && needResend,
                'with-avatar': !hideHeader
            })}
        >
            {showDateDivider && <MessageDivider date={message.date} />}
            {headerView}
            {timeLabelView}
            {contentView && <div className="app-message-content">{contentView}</div>}
            {resendButtonsView}
        </div>);
    }
}

export default MessageListItem;
