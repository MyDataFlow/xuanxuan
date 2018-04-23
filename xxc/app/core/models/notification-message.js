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

        if (DEBUG) {
            if (!data.title) {
                data.title = '通知标题测试';
            }
            if (!data.subtitle) {
                data.subtitle = '通知副标题测试';
            }
            if (!data.content) {
                data.content = '为了解决这个问题，2014年 Facebook 提出了 Flux 架构的概念，引发了很多的实现。2015年，Redux 出现，将 Flux 与函数式编程结合一起，很短时间内就成为了最热门的前端架构。\nEvery React component is like a small system that operates on its own. It has its own state, input and output. In the following section we will explore these characteristics.';
            }
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
