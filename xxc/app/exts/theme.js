import Path from 'path';
import StringHelper from '../utils/string-helper';
import PinYin from '../utils/pinyin';
import SearchScore from '../utils/search-score';

const INJECT_TYPE = {
    append: 'append',
    override: 'override',
};

const MATCH_SCORE_MAP = [
    {name: 'name', equal: 100, include: 50},
    {name: 'displayName', equal: 100, include: 50},
    {name: 'pinyinNames', equal: 50, include: 25, array: true},
    {name: 'description', include: 25},
    {name: 'author', equal: 100, prefix: '@'},
    {name: 'publisher', equal: 100, prefix: '@'},
    {name: 'extKeywords', equal: 50, include: 10, array: true},
    {name: 'extDisplayName', equal: 50, include: 25},
    {name: 'extName', equal: 50, include: 25},
    {name: 'extPinyinNames', equal: 50, include: 25, array: true},
];

export default class Theme {
    constructor(data, extension) {
        if (!data) {
            throw new Error('Theme error: The "data" prama can not be empty.');
        }
        if (!extension) {
            throw new Error('Theme error: The "extension" prama can not be empty.');
        }

        this._extension = extension;
        this._data = data;
    }

    get color() {
        return this._data.color;
    }

    get extension() {
        return this._extension;
    }

    get name() {
        return this._data.name;
    }

    get displayName() {
        return StringHelper.ifEmptyThen(this._data.displayName, this.name);
    }

    get pinyinNames() {
        if (!this._pinyinName) {
            this._pinyinName = PinYin(this.displayName, 'default', false);
        }
        return this._pinyinName;
    }

    get id() {
        if (!this._id) {
            this._id = `${this.extension.name}:${this.name}`;
        }
        return this._id;
    }

    get inject() {
        return INJECT_TYPE[this._data.inject] || INJECT_TYPE.append;
    }

    get isAppend() {
        return this.inject === INJECT_TYPE.append;
    }

    get isOverride() {
        return this.inject === INJECT_TYPE.override;
    }

    get styleFile() {
        const style = this._data.style;
        if (style && !this._styleFile) {
            if (!style.startsWith('https://') && !style.startsWith('http://')) {
                this._styleFile = `file://${Path.join(this.extension.localPath, style)}`;
            } else {
                this._styleFile = style;
            }
        }
        return this._styleFile;
    }

    get preview() {
        const preview = this._data.preview;
        if (preview && !this._preview) {
            if (!preview.startsWith('https://') && !preview.startsWith('http://')) {
                this._preview = Path.join(this.extension.localPath, preview);
            } else {
                this._preview = preview;
            }
        }
        return this._preview;
    }

    get author() {return this.extension.author;}
    get publisher() {return this.extension.publisher;}
    get extKeywords() {return this.extension.keywords;}
    get extDisplayName() {return this.extension.displayName;}
    get extName() {return this.extension.name;}
    get extPinyinNames() {return this.extension.pinyinNames;}
    get extDescription() {return this.extension.description;}

    getMatchScore(keys) {
        return SearchScore.matchScore(MATCH_SCORE_MAP, this, keys);
    }
}
