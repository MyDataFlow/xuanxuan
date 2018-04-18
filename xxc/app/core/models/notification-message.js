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
            if (!data.subtitle) {
                data.subtitle = '副标题';
            }
            if (!data.content) {
                data.content = 'JavaScript ( JS ) 是一种具有头等函数的轻量级解释型或即时编译型的编程语言。虽然它是作为开发web 页面的脚本语言而出名的，但是它也被用到了很多非浏览器环境中，例如 node.js、 Apache CouchDB 和 Adobe Acrobat。JavaScript是一种基于原型编程、多范式的动态脚本语言，并且支持面向对象、命令式和声明式（如函数式编程）风格。了解更多 JavaScript。';
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
