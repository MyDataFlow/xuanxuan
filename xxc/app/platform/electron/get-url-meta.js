import cheerio from 'cheerio';
import {request, getTextFromResponse} from '../common/network';
import limitTimePromise from '../../utils/limit-time-promise';

export class UrlMeta {
    constructor(url) {
        this.url = url;
        this.parsedUrl = new URL(this.url);
        this.scheme = this.parsedUrl.protocol;
        this.host = this.parsedUrl.host;
        this.rootUrl = this.scheme + "//" + this.host;
    }

    inspectFromResponse(response) {
        this.response = response;
        const contentType = response.headers.get('content-type');
        this.contentTypeOrigin = contentType;
        if (contentType.startsWith('image')) {
            this.contentType = 'image';
        } else if (contentType.startsWith('video')) {
            this.contentType = 'video';
        } else {
            this.contentType = 'page';
            return getTextFromResponse(response).then(documentSource => {
                this.document = documentSource;
                this.parsedDocument = cheerio.load(documentSource);
                return Promise.resolve(this);
            });
        }
        return Promise.resolve(this);
    }

    get isPage() {
        return this.contentType === 'page';
    }

    get isImage() {
        return this.contentType === 'image';
    }

    get isVideo() {
        return this.contentType === 'video';
    }

    get title() {
        if (!this.isPage) {
            return this.url;
        }
        if (this._title === undefined) {
            this._title = this.parsedDocument('head > title').text() || null;
        }
        return this._title;
    }

    get ogTitle() {
        if (!this.isPage) {
            return this.url;
        }
        if (this._ogTitle === undefined) {
            this._ogTitle = this.parsedDocument("meta[property='og:title']").attr("content") || null;
        }
        return this._ogTitle;
    }

    get ogDescription() {
        if (!this.isPage) {
            return '';
        }
        if (this._ogDescription === undefined) {
            this._ogDescription = this.parsedDocument("meta[property='og:description']").attr("content") || null;
        }
        return this._ogDescription;
    }

    get ogType() {
        if (this._ogType === undefined) {
            this._ogType = this.parsedDocument("meta[property='og:type']").attr("content") || null;
        }
        return this._ogType;
    }

    get ogUpdatedTime() {
        if (this._ogUpdatedTime === undefined) {
            this._ogUpdatedTime = this.parsedDocument("meta[property='og:updated_time']").attr("content") || null;
        }
        return this._ogUpdatedTime;
    }

    get ogLocale() {
        if (this._ogLocale === undefined) {
            this._ogLocale = this.parsedDocument("meta[property='og:locale']").attr("content") || null;
        }
        return this._ogLocale;
    }

    get links() {
        if (this._links === undefined) {
            this._links = this.parsedDocument('a').map((i, elem) => {
                return this.parsedDocument(elem).attr('href');
            });
        }
        return this._links;
    }

    get metaDescription() {
        if (this._metaDescription === undefined) {
            this._metaDescription = this.parsedDocument("meta[name='metaDescription']").attr("content") || null;
        }
        return this._metaDescription;
    }

    get secondaryDescription() {
        if (this._secondaryDescription === undefined) {
            this._secondaryDescription = null;
            this.parsedDocument("p").each((i, elem) => {
                if(this._secondaryDescription !== undefined){
                    return;
                }

                const text = this.parsedDocument(elem).text();

                // If we found a paragraph with more than
                if(text.length >= minimumPLength) {
                    this._secondaryDescription = text;
                }
            });
        }
        return this._secondaryDescription;
    }

    get description() {
        if (!this.isPage) {
            return '';
        }
        return this.metaDescription || this.secondaryDescription;
    }

    get keywords() {
        if (this._keywords === undefined) {
            const keywordsString = this.parsedDocument("meta[name='keywords']").attr("content");

            if(keywordsString) {
                this._keywords = keywordsString.split(',');
            } else {
                this._keywords = [];
            }
        }
        return this._keywords;
    }

    get author() {
        if (this._author === undefined) {
            this._author = this.parsedDocument("meta[name='author']").attr("content") || null;
        }
        return this._author;
    }

    get charset() {
        if (this._charset === undefined) {
            this._charset = this.parsedDocument("meta[charset]").attr("charset") || null;
        }
        return this._charset;
    }

    get image() {
        if (!this.isPage) {
            return null;
        }
        if (this._image === undefined) {
            const img = this.parsedDocument("meta[property='og:image']").attr("content");
            if (img) {
                this._image = this.getAbsolutePath(img);
            } else {
                this._image = null;
            }
        }
        return this._image;
    }

    get feeds() {
        if (this._feeds === undefined) {
            this._feeds = this.parseFeeds("rss") || this.parseFeeds("atom") || null;
        }
        return this._feeds;
    }

    get favicons() {
        if (this._favicons === undefined) {
            this._favicons = this.parseFavicons("shortcut icon").concat(
                this.parseFavicons("icon"),
                this.parseFavicons("apple-touch-icon"),
                this.parseFavicons('favicon.ico'),
            ) || null;
        }
        return this._favicons;
    }

    get favicon() {
        return this.favicons[0];
    }

    parseFeeds(format) {
        var feeds = this.parsedDocument("link[type='application/" + format + "+xml']").map((i, elem) => {
            return this.parsedDocument(elem).attr('href');
        });

        return feeds;
    }

    getAbsolutePath(href) {
        if((/^(http:|https:)?\/\//i).test(href)) {
            return href;
        }
        if(!(/^\//).test(href)) {
            href = '/' + href;
        }
        return this.rootUrl + href;
    }

    parseFavicons(format) {
        if (format === 'favicon.ico') {
            return [{
                href: this.getAbsolutePath('favicon.ico'),
                sizes: '',
            }];
        }
        if (!this.isPage) {
            return [];
        }
        const favicons = this.parsedDocument("link[rel='" + format + "']").map((i, elem) => {
            const href = this.parsedDocument(elem).attr('href');
            const sizes = this.parsedDocument(elem).attr('sizes');
            return {
                href: this.getAbsolutePath(href),
                sizes: sizes || ''
            };
        });

        return [].slice.call(favicons);
    }

    static inspect(url) {
        return limitTimePromise(request(url), 5000).then(response => {
            return new UrlMeta(url).inspectFromResponse(response);
        });
    }
}

export default UrlMeta.inspect;
