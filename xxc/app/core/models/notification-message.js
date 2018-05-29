import Config from 'Config';
import ChatMessage from './chat-message';
import Member from './member';
import stringHelper from '../../utils/string-helper';

export default class NotificationMessage extends ChatMessage {
    get sender() {
        if (!this._sender) {
            const notification = this.notification;
            this._sender = new Member(notification.sender.id === 'ranzhi' ? {
                id: 'ranzhi',
                realname: '然之协同',
                system: true,
                avatar: `$${Config.media['image.path']}ranzhi-icon.png`
            } : notification.sender);
        }
        return this._sender;
    }

    get senderId() {
        return this.notification.sender.id || 'robot1';
    }

    get isNotification() {
        return true;
    }

    get actions() {
        const notification = this.notification;
        let actions = notification.actions;
        if (actions && !Array.isArray(actions)) {
            actions = [actions];
        }
        return actions;
    }

    get notification() {
        return this.data;
    }

    getSender() {
        return this.sender;
    }

    get needCheckResend() {
        return false;
    }

    get isSendFailed() {
        return false;
    }

    get isOutdated() {
        return false;
    }

    static create(data) {
        if (data instanceof ChatMessage) {
            return data;
        }
        if (data.data) {
            data = data.data;
        }

        let content = `#### ${data.title}`;
        if (stringHelper.isNotEmpty(data.subtitle)) {
            content += `\n##### ${data.subtitle}`;
        }
        if (stringHelper.isNotEmpty(data.content)) {
            content += `\n${data.content}`;
        }

        return new NotificationMessage({
            cgid: 'littlexx',
            content,
            contentType: data.contentType,
            data,
            date: data.date,
            gid: data.gid,
            user: data.sender.id,
            type: 'notification',
            id: data.id,
        });
    }
}
