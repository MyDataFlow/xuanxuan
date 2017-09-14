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

    render() {
        let {
            message,
            lastMessage,
            showDateDivider,
            hideHeader,
            className,
            style,
            children,
            ...other
        } = this.props;

        if(showDateDivider === 0) {
            showDateDivider = !lastMessage || !DateHelper.isSameDay(message.date, lastMessage.date);
        }
        if(hideHeader === 0) {
            hideHeader = !showDateDivider && lastMessage && lastMessage.senderId === message.senderId;
        }

        let headerView = null;
        if(!hideHeader) {
            const sender = message.getSender(App.members);
            headerView = <div className="app-message-item-header">
                <UserAvatar className="state" user={sender} onContextMenu={this.handleUserContextMenu.bind(this, sender)} onClick={MemberProfileDialog.show.bind(null, sender, null)}/>
                <header>
                    <a className="title rounded text-primary" onContextMenu={this.handleUserContextMenu.bind(this, sender)} onClick={this.handleSenderNameClick.bind(this, sender, message)}>{sender.displayName}</a>
                    <small className="time">{DateHelper.formatDate(message.date, 'hh:mm')}</small>
                </header>
            </div>;
        }

        let timeLabelView = null;
        if(!headerView) {
            let hideTimeLabel = false;
            if(hideHeader && !showDateDivider && lastMessage && message.date && (message.date - lastMessage.date) <= showTimeLabelInterval) {
                hideTimeLabel = true;
            }
            timeLabelView = <span className={HTML.classes('app-message-item-time-label', {'as-dot': hideTimeLabel})}>{DateHelper.formatDate(message.date, 'hh:mm')}</span>;
        }

        let contentView = null;
        if(message.isFileContent) {
            contentView = <MessageContentFile message={message}/>;
        } else if(message.isImageContent) {
            contentView = <MessageContentImage message={message}/>;
        } else {
            contentView = <MessageContentText message={message}/>;
        }

        return <div {...other}
            className={HTML.classes('app-message-item', className)}
        >
            {showDateDivider && <MessageDivider date={message.date}/>}
            {headerView}
            {timeLabelView}
            {contentView && <div className="app-message-content">{contentView}</div>}
        </div>;
    }
}

export default MessageListItem;
