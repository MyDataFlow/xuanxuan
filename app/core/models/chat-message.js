import Entity from './entity';
import Status from '../../utils/status';
import Member from './member';
import Markdown from '../../utils/markdown';
import Emojione from '../../components/emojione';
import TimeSequence from '../../utils/time-sequence';

const STATUS = new Status({
    draft: 0,
    sending: 1,
    sendFail: 2,
    ok: 3,
}, 0);

const TYPES = {
    boardcast: 'boardcast',
    normal: 'normal',
};

const CONTENT_TYPES = {
    file: 'file',
    image: 'image',
    text: 'text',
    emoticon: 'emoticon',
};

const SEND_WAIT_TIME = 10000;

class ChatMessage extends Entity {

    static NAME = 'ChatMessage';
    static STATUS = STATUS;
    static TYPES = TYPES;
    static CONTENT_TYPES = CONTENT_TYPES;
    static SCHEMA = Entity.SCHEMA.extend({
        cgid: {type: 'string', indexed: true},
        user: {type: 'int', indexed: true},
        date: {type: 'timestamp', indexed: true},
        type: {type: 'string', indexed: true},
        contentType: {type: 'string', indexed: true},
        content: {type: 'string'},
        unread: {type: 'boolean', indexed: true},
        status: {type: 'int', indexed: true},
    });

    constructor(data, entityType = ChatMessage.NAME) {
        super(data, entityType);
        this._status = STATUS.create(this.$.status);
        this._status.onChange = newStatus => {
            this.$.status = newStatus;
            if(typeof this.onStatusChange === 'function') {
                this.onStatusChange(newStatus, this);
            }
        };
        if(!this.$.order) {
            this.$.order = TimeSequence();
        }
    }

    plainServer() {
        return {
            gid: this.gid,
            cgid: this.cgid,
            type: this.type,
            contentType: this.contentType,
            content: this.content,
            date: "",
            user: this.senderId
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
        return this.$.order;
    }

    set order(order) {
        this.$.order = order;
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
            if(this.isStatus(STATUS.sending)) {
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
        if(!this._sender) {
            return new Member({
                id: this.senderId
            });
        }
        return this._sender;
    }

    set sender(sendUser) {
        if(sendUser) {
            this._sender = sendUser;
            this.$set('user', sendUser.id);
        }
    }

    getSender(appMembers) {
        if(!this._sender) {
            this._sender = appMembers.get(this.senderId);
        }
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
        return this.contentType === CONTENT_TYPES.text;
    }

    get isImageContent() {
        return this.contentType === CONTENT_TYPES.image;
    }

    get type() {
        return this.$get('type', TYPES.normal);
    }

    set type(type) {
        this.$set('type', type);
    }

    get isBroadcast() {
        return this.type === TYPES.boardcast;
    }

    get content() {
        return this.$get('content');
    }

    set content(newContent) {
        this.$set('content', newContent);
        if(this._imageContent) {
            delete this._imageContent;
        }
        if(this._fileContent) {
            delete this._fileContent;
        }
        if(this._renderedTextContent) {
            delete this._renderedTextContent;
            delete this._isBlockContent;
        }
    }

    renderedTextContent(callback) {
        if(this._renderedTextContent === undefined) {
            let content = this.content;
            if(typeof content === 'string' && content.length) {
                content = content.replace(/\n\n\n/g, '\u200B\n\u200B\n\u200B\n').replace(/\n\n/g, '\u200B\n\u200B\n');
                content = Markdown(content);
                content = Emojione.toImage(content);
                if(callback) {
                    content = callback(content);
                }
                this._renderedTextContent = content;
                this._isBlockContent = content && (content.includes('<h1 id="') || content.includes('<h2 id="') || content.includes('<h3 id="'));
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
        if(this.contentType === CONTENT_TYPES.image) {
            if(!this._imageContent) {
                this._imageContent = JSON.parse(this.content);
            }
            return this._imageContent;
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
        if(this.contentType === CONTENT_TYPES.file) {
            if(!this._fileContent) {
                this._fileContent = JSON.parse(this.content);
            }
            if(this._fileContent) {
                this._fileContent.user = this.user;
                this._fileContent.sender = this.sender;
                this._fileContent.attachFile = this.attachFile;
                this._fileContent.date = this.sendTime;
                this._fileContent.gid = this.gid;
            }
            return this._fileContent;
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
            time: content.time
        });
        this._fileContent = content;
    }

    updateFileContent(content) {
        this._fileContent = Object.assign({}, this.fileContent, content);
        this.content = JSON.stringify(this._fileContent);
    }

    getCommand() {
        if(this.contentType === 'text') {
            const content = this.content.trim();
            if(content === '$$version') {
                return {action: 'version'};
            }
        }
        return null;
    }

    static create(chatMessage) {
        if(chatMessage instanceof ChatMessage) {
            return chatMessage;
        }
        return new ChatMessage(chatMessage);
    }

    reset(newData) {
        if(newData instanceof ChatMessage) {
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
}

export default ChatMessage;
