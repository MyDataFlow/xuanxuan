import Entity from './entity';
import Member from './member';
import SearchScore from '../../utils/search-score';

const MATCH_SCORE_MAP = [
    {name: 'name', equal: 100, include: 50},
    {name: 'category', equal: 100, prefix: ':'},
    {name: 'cgid', equal: 100, prefix: '#'},
    {name: 'senderId', equal: 100, prefix: '@'},
    {name: 'extName', equal: 100, prefix: '.'},
];

const CATEGORIES = [
    {name: 'doc', like: new Set(['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'key', 'page', 'number', 'pdf', 'txt', 'md', 'rtf', 'wps', 'html', 'htm', 'chtml', 'epub', ''])},
    {name: 'image', like: new Set(['jpg', 'jpeg', 'sketch', 'psd', 'png', 'gif', 'tiff', 'ico', 'icns', 'svg'])},
    {name: 'program', like: new Set(['js', 'exe', 'app', 'dmg', 'msi', 'bat', 'sh'])}
];

export default class FileData extends Entity {
    static CATEGORIES = CATEGORIES;
    static NAME = 'FileData';
    static SCHEMA = Entity.SCHEMA.extend({
        cgid: {type: 'string', indexed: true},
        senderId: {type: 'int', indexed: true},
        size: {type: 'int', indexed: true},
        date: {type: 'timestamp', indexed: true},
        type: {type: 'string', indexed: true},
        name: {type: 'string', indexed: true},
        send: {
            type: 'int',
            indexed: true,
            getter: val => {
                if (val === -1) {
                    return true;
                }
                if (val === -2) {
                    return false;
                }
                return val;
            },
            setter: val => {
                if (val === true) {
                    return -1;
                }
                if (val === false) {
                    return -2;
                }
                return val;
            }
        },
    });

    constructor(data, entityType = FileData.NAME) {
        super(data, entityType);
        if (data.time) {
            this.date = data.time;
        }
    }

    get schema() {
        return FileData.SCHEMA;
    }

    plain() {
        const plainData = super.plain();
        delete plainData.path;
        return plainData;
    }

    get json() {
        return JSON.stringify(this.plain());
    }

    /**
     * Get chat gid
     */
    get cgid() {
        return this.$get('cgid');
    }

    /**
     * Set chat gid
     */
    set cgid(gid) {
        this.$set('cgid', gid);
    }

    /**
     * Get file send time
     */
    get date() {
        return this.$get('date');
    }

    /**
     * Set file send time
     */
    set date(date) {
        this.$set('date', date);
    }

    get time() {
        return Math.floor(this.date / 1000);
    }

    set time(time) {
        this.date = time;
    }

    get senderId() {
        return this.$get('senderId');
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
        if (!this._sender) {
            this._sender = appMembers.get(this.senderId);
        }
        return this._sender;
    }

    get type() {
        return this.$get('type');
    }

    set type(type) {
        this.$set('type', type);
    }

    get isImage() {
        const type = this.type;
        return type && type.startsWith('image');
    }

    get size() {
        return this.$get('size');
    }

    set size(size) {
        this.$set('size', size);
    }

    get name() {
        return this.$get('name');
    }

    set name(name) {
        this.$set('name', name);
    }

    get send() {
        return this.$get('send');
    }

    set send(send) {
        this.$set('send', send);
    }

    get isOK() {
        return this.id && this.send === true;
    }

    get extName() {
        if (this._extName === undefined) {
            const name = this.name;
            const dotIndex = name.lastIndexOf('.');
            this._extName = dotIndex > -1 ? name.substr(dotIndex + 1) : '';
        }
        return this._extName;
    }

    get attachFile() {
        return this._attachFile;
    }

    set attachFile(attachFile) {
        this._attachFile = attachFile;
    }

    get category() {
        if (!this._category) {
            this._category = 'other';
            const extName = this.extName;
            if (extName) {
                for (const cat of CATEGORIES) {
                    if (cat.like.has(extName)) {
                        this._category = cat.name;
                        break;
                    }
                }
            }
        }
        return this._category;
    }

    getMatchScore(keys) {
        return SearchScore.matchScore(MATCH_SCORE_MAP, this, keys);
    }

    static create(fileData) {
        if (fileData instanceof FileData) {
            return fileData;
        }
        return new FileData(fileData);
    }
}
