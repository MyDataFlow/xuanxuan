import UUID from 'uuid';
import md5 from 'md5';
import Entity from './entity';
import Member from './member';
import SearchScore from '../../utils/search-score';

const dataURItoBlob = (dataURI) => {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    const byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    const bb = new Blob([ab], {type: mimeString});
    return bb;
};

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
        width: {type: 'int', indexed: false},
        height: {type: 'int', indexed: false},
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
        if (data.originFile) {
            this.originFile = data.originFile;
        }
        if (data.path) {
            this.path = data.path;
        }
    }

    ensureGid() {
        if (!this.$.gid) {
            if (this.isOK) {
                this.$.gid = md5(`${this.name}:${this.date}:${this.id}`);
            } else {
                this.$.gid = UUID();
            }
        }
    }

    get originType() {
        const originFile = this.originFile;
        if (originFile) {
            if (originFile instanceof File) {
                return 'file';
            }
            if (originFile.base64) {
                return 'base64';
            }
            if (originFile.blob) {
                return 'blob';
            }
        }
        return null;
    }

    get originData() {
        const originType = this.originType;
        const originFile = this.originFile;
        if (originType && originFile) {
            if (originType === 'blob') {
                return originFile.blob;
            } else if (originType === 'file') {
                return originFile;
            }
            if (originType === 'base64') {
                originFile.blob = dataURItoBlob(originFile.base64);
                return originFile.blob;
            }
        }
        return null;
    }

    getViewUrl(user) {
        const originFile = this.originFile;
        if (originFile) {
            if (!this._viewUrl) {
                this._viewUrl = originFile.path || this.localPath;
                if (this._viewUrl && !this._viewUrl.startsWith('http://') && !this._viewUrl.startsWith('https://') && !this._viewUrl.startsWith('file://')) {
                    this._viewUrl = `file://${this._viewUrl}`;
                }
            }
            if (!this._viewUrl) {
                if (originFile.blob) {
                    this._viewUrl = URL.createObjectURL(originFile.blob);
                } else {
                    this._viewUrl = originFile.base64;
                }
            }
            if (!this._viewUrl && (originFile instanceof File || originFile instanceof Blob)) {
                this._viewUrl = URL.createObjectURL(originFile);
            }
            if (!this._viewUrl) {
                this._viewUrl = this.makeUrl(user);
            }
        }
        return this._viewUrl;
    }

    get viewUrl() {
        return this.getViewUrl();
    }

    get schema() {
        return FileData.SCHEMA;
    }

    plain() {
        const plainData = super.plain();
        delete plainData.path;
        delete plainData.originFile;
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
     * Get file storageName
     */
    get storageName() {
        return `${this.gid}.${this.extName}`;
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

    get width() {
        return this.$get('width');
    }

    set width(width) {
        this.$set('width', width);
    }

    get height() {
        return this.$get('height');
    }

    set height(height) {
        this.$set('height', height);
    }

    get imageInfo() {
        const width = this.width;
        const height = this.height;
        return width && height ? {width, height} : null;
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

    makeUrl(user) {
        if (!this._url && user) {
            this._url = user.makeServerUrl(`download?fileName=${encodeURIComponent(this.name)}&time=${this.time || 0}&id=${this.id}&ServerName=${user.serverName}&gid=${user.id}&sid=${md5(user.sessionID + this.name)}`);
        }
        return this._url;
    }

    get url() {
        return this._url;
    }

    static create(fileData) {
        if (fileData instanceof FileData) {
            return fileData;
        }
        if (fileData instanceof File || fileData.base64 || fileData.blob) {
            const originFile = fileData;
            fileData = {
                date: originFile.lastModifiedDate || new Date().getTime(),
                name: originFile.name,
                size: originFile.size,
                width: originFile.width,
                height: originFile.height,
                send: 0,
                type: originFile.type,
                originFile
            };
        }
        return new FileData(fileData);
    }
}
