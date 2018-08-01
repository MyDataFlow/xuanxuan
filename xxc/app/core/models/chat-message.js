import Entity from './entity';
import Status from '../../utils/status';
import Member from './member';

const STATUS = new Status({
    draft: 0,
    sending: 1,
    sendFail: 2,
    ok: 3,
}, 0);

const TYPES = {
    broadcast: 'broadcast',
    normal: 'normal',
    notification: 'notification'
};

const CONTENT_TYPES = {
    file: 'file',
    image: 'image',
    text: 'text',
    plain: 'plain',
    emoticon: 'emoticon',
    object: 'object'
};

const OBJECT_TYPES = {
    default: 'default',
    url: 'url'
};

const SEND_WAIT_TIME = 10000;

class ChatMessage extends Entity {
    static NAME = 'ChatMessage';
    static STATUS = STATUS;
    static TYPES = TYPES;
    static CONTENT_TYPES = CONTENT_TYPES;
    static OBJECT_TYPES = OBJECT_TYPES;
    static SCHEMA = Entity.SCHEMA.extend({
        cgid: {type: 'string', indexed: true},
        user: {type: 'int', indexed: true},
        order: {type: 'int', indexed: true},
        date: {type: 'timestamp', indexed: true},
        type: {type: 'string', indexed: true, defaultValue: TYPES.normal},
        contentType: {type: 'string', indexed: true, defaultValue: CONTENT_TYPES.text},
        content: {type: 'string', defaultValue: null},
        unread: {type: 'boolean', indexed: true, defaultValue: false},
        status: {type: 'int', indexed: true},
        data: {type: 'json'},
    });

    constructor(data, entityType = ChatMessage.NAME) {
        super(data, entityType);
        this._status = STATUS.create(this.$.status);
        this._status.onChange = newStatus => {
            this.$.status = newStatus;
            if (typeof this.onStatusChange === 'function') {
                this.onStatusChange(newStatus, this);
            }
        };
        if (!this.$.contentType) {
            this.$.contentType = CONTENT_TYPES.text;
        }
        if (!this.$.type) {
            this.$.type = TYPES.normal;
        }
        if (!this.$.date) {
            this.$.date = new Date().getTime();
        }
    }

    plainServer() {
        return {
            gid: this.gid,
            cgid: this.cgid,
            type: this.type,
            contentType: this.contentType,
            content: this.content,
            date: '',
            user: this.senderId,
            order: this.order,
        };
    }

    get schema() {
        return ChatMessage.SCHEMA;
    }

    set id(remoteId) {
        super.id = remoteId;
        this._status.change(remoteId ? STATUS.ok : STATUS.sendFail);
    }

    get id() {
        return this.$get('id', 0);
    }

    get order() {
        return this.$get('order', 0);
    }

    set order(order) {
        this.$set('order', order);
    }

    // ChatMessage status

    get status() {
        return this._status.value;
    }

    get statusName() {
        return this._status.name;
    }

    isStatus(status) {
        return this._status.is(status);
    }

    get isSendFail() {
        return this.isStatus(STATUS.sendFail);
    }

    get isOK() {
        return this.isStatus(STATUS.ok);
    }

    get isSending() {
        return this.isStatus(STATUS.sending);
    }

    get isDraft() {
        return this.isStatus(STATUS.draft);
    }

    beginSend() {
        this.$set('date', new Date().getTime());
        this._status.change(STATUS.sending);
        setTimeout(() => {
            if (this.isStatus(STATUS.sending)) {
                this._status.change(STATUS.sendFail);
            }
        }, SEND_WAIT_TIME);
    }

    endSend(remoteId) {
        this.id = remoteId;
    }

    get cgid() {
        return this.$get('cgid');
    }

    set cgid(gid) {
        this.$set('cgid', gid);
    }

    get unread() {
        return this.$get('unread');
    }

    set unread(unread) {
        this.$set('unread', unread);
    }

    get data() {
        if (this._data === undefined) {
            this._data = this.$get('data');
        }
        return this._data;
    }

    set data(data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
            delete this._data;
        }
        this.$set('data', data);
    }

    get date() {
        return this.$get('date');
    }

    set date(date) {
        this.$set('date', date);
    }

    get sendTime() {
        return this.date;
    }

    get senderId() {
        return this.$get('user');
    }

    isSender(userId) {
        return this.senderId === userId;
    }

    get sender() {
        if (!this._sender) {
            return new Member({
                id: this.senderId
            });
        }
        return this._sender;
    }

    set sender(sendUser) {
        if (sendUser) {
            this._sender = sendUser;
            this.$set('user', sendUser.id);
        }
    }

    getSender(appMembers) {
        this._sender = appMembers.get(this.senderId);
        return this._sender;
    }

    get contentType() {
        return this.$get('contentType', CONTENT_TYPES.text);
    }

    set contentType(type) {
        this.$set('contentType', type);
    }

    get isFileContent() {
        return this.contentType === CONTENT_TYPES.file;
    }

    get isTextContent() {
        return this.contentType === CONTENT_TYPES.text || this.contentType === CONTENT_TYPES.plain;
    }

    get isPlainTextContent() {
        return this.contentType === CONTENT_TYPES.plain;
    }

    get isImageContent() {
        return this.contentType === CONTENT_TYPES.image;
    }

    get isObjectContent() {
        return this.contentType === CONTENT_TYPES.object;
    }

    get objectContentType() {
        return this.isObjectContent ? this.objectContent.type : null;
    }

    get objectContent() {
        if (this.isObjectContent) {
            let objectContent = this._objectContent;
            if (!objectContent) {
                objectContent = JSON.parse(this.content);
                if (objectContent.path) {
                    delete objectContent.path;
                }
                this._objectContent = objectContent;
            }
            return objectContent;
        }
        return null;
    }

    get type() {
        return this.$get('type', TYPES.normal);
    }

    set type(type) {
        this.$set('type', type);
    }

    get isBroadcast() {
        return this.type === TYPES.broadcast;
    }

    get content() {
        return this.$get('content');
    }

    set content(newContent) {
        this.$set('content', newContent);
        if (this._imageContent) {
            delete this._imageContent;
        }
        if (this._fileContent) {
            delete this._fileContent;
        }
        if (this._objectContent) {
            delete this._objectContent;
        }
        if (this._renderedTextContent) {
            delete this._renderedTextContent;
            delete this._isBlockContent;
        }
    }

    renderedTextContent(...converters) {
        if (this._renderedTextContent === undefined) {
            let content = this.content;
            const renderOptions = {renderMarkdown: !this.isPlainTextContent};
            if (typeof content === 'string' && content.length) {
                if (converters && converters.length) {
                    converters.forEach(converter => {
                        content = converter(content, renderOptions);
                    });
                }
                this._renderedTextContent = content;
                this._isBlockContent = content && (content.includes('<h1>') || content.includes('<h2>') || content.includes('<h3>'));
            } else {
                this._renderedTextContent = '';
                this._isBlockContent = false;
            }
        }
        return this._renderedTextContent;
    }

    get isBlockContent() {
        return this.renderedTextContent && this._isBlockContent;
    }

    get imageContent() {
        if (this.isImageContent) {
            let imageContent = this._imageContent;
            if (!imageContent) {
                imageContent = JSON.parse(this.content);
                if (imageContent.path) {
                    delete imageContent.path;
                }
                this._imageContent = imageContent;
            }
            return imageContent;
        }
        return null;
    }

    set imageContent(content) {
        delete content.path;

        this.contentType = CONTENT_TYPES.image;
        this._imageContent = content;
        this.content = JSON.stringify(content);
    }

    updateImageContent(content) {
        this._imageContent = Object.assign({}, this.imageContent, content);
        this.content = JSON.stringify(this._imageContent);
    }

    get fileContent() {
        if (this.isFileContent) {
            let fileContent = this._fileContent;
            if (!fileContent) {
                fileContent = JSON.parse(this.content);
                if (fileContent.path) {
                    delete fileContent.path;
                }
                this._fileContent = fileContent;
            }
            if (fileContent) {
                fileContent.user = this.user;
                if (this._sender) {
                    fileContent.sender = this.sender;
                }
                fileContent.senderId = this.senderId;
                fileContent.attachFile = this.attachFile;
                fileContent.date = this.sendTime;
                fileContent.gid = this.gid;
            }
            return fileContent;
        }
        return null;
    }

    set fileContent(content) {
        delete content.path;

        this.contentType = CONTENT_TYPES.file;
        this.content = JSON.stringify({
            name: content.name || content.title,
            size: content.size,
            send: content.send,
            type: content.type,
            id: content.id,
            time: content.time,
            isImage: content.type && content.type.startsWith('image')
        });
        this._fileContent = content;
    }

    updateFileContent(content) {
        this._fileContent = Object.assign({}, this.fileContent, content);
        this.content = JSON.stringify(this._fileContent);
    }

    getCommand() {
        if (this.contentType === 'text') {
            const content = this.content.trim();
            if (content === '$$version') {
                return {action: 'version'};
            } else if (content === '$$dataPath') {
                return {action: 'dataPath'};
            }
        }
        return null;
    }

    reset(newData) {
        if (newData instanceof ChatMessage) {
            newData = newData.plain();
        }
        this.$set(newData);
        this._status.change(newData.status);
        delete this._fileContent;
        delete this._imageContent;
        delete this._isBlockContent;
        delete this._renderedTextContent;
        delete this._sender;
    }

    /**
     * Check the message whether need to check resend
     * @return {boolean}
     */
    get needCheckResend() {
        return !this.id;
    }

    /**
     * Check the message whether need to resend
     * @return {boolean}
     */
    get needResend() {
        return this.needCheckResend && this.isSendFailed && !this.isFileContent && !this.isImageContent;
    }

    get isSendFailed() {
        return this.needCheckResend && this.isOutdated;
    }

    /**
     * Check the message whether is outdated
     * @return {boolean}
     */
    get isOutdated() {
        return (new Date().getTime() - this.date) > 10000;
    }

    static create(chatMessage) {
        if (chatMessage instanceof ChatMessage) {
            return chatMessage;
        }
        return new ChatMessage(chatMessage);
    }

    static sort(messages) {
        return messages.sort((x, y) => {
            let orderResult = x.date - y.date;
            if (orderResult === 0 && x.order && y.order) {
                orderResult = x.order - y.order;
            }
            if (orderResult === 0) {
                orderResult = (x.id || Number.MAX_SAFE_INTEGER) - (y.id || Number.MAX_SAFE_INTEGER);
            }
            return orderResult;
        });
    }
}

export default ChatMessage;
