import Config from 'Config';
import Marked from 'marked';
import HighlightJS from 'highlight.js';
import HTMLParser from 'fast-html-parser';
import Lang from '../lang';
import {strip} from './html-helper';

export const renderer = new Marked.Renderer();

renderer.code = (code, lang) => {
    let fileName = null;
    if (lang) {
        const colonIndex = lang.indexOf(':');
        const dotIndex = lang.lastIndexOf('.');
        if (colonIndex > -1) {
            fileName = lang.substr(colonIndex + 1);
            lang = lang.substr(0, colonIndex);
        } else if (dotIndex > -1) {
            fileName = lang;
            lang = lang.substr(dotIndex + 1);
        }
    }
    const result = HighlightJS.highlightAuto(code, lang ? [lang] : undefined);
    return `<pre class="code-block" ${fileName ? (` data-name="${fileName}"`) : ''}><div class="hint--left btn-copy-code app-link" data-url="!copyCode/${lang || ''}" data-hint="${Lang.string('common.copyCode')}"><button class="btn iconbutton rounded primary-pale text-primary" type="button"><i class="icon mdi mdi-code-not-equal-variant icon-2x"></i></button></div><code data-lang="${lang || ''}" class="lang-${result.language}">${result.value}</code></pre>`;
};

const commonAttrs = new Set(['class', 'style']);
const allowedTags = {
    a: new Set(['class', 'href', 'title', 'style']),
    b: commonAttrs,
    blockquote: commonAttrs,
    code: true,
    em: commonAttrs,
    h1: commonAttrs,
    h2: commonAttrs,
    h3: commonAttrs,
    h4: commonAttrs,
    h5: commonAttrs,
    h6: commonAttrs,
    li: commonAttrs,
    ol: commonAttrs,
    ul: commonAttrs,
    p: commonAttrs,
    pre: commonAttrs,
    address: commonAttrs,
    s: commonAttrs,
    i: commonAttrs,
    sub: commonAttrs,
    sup: commonAttrs,
    strong: commonAttrs,
    kbd: true,
    del: true,
    mark: true,
    ins: true,
    hr: true,
    var: true,
    table: commonAttrs,
    tr: commonAttrs,
    thead: commonAttrs,
    th: new Set(['class', 'style', 'colspan', 'rowspan']),
    td: new Set(['class', 'style', 'colspan', 'rowspan']),
    tfoot: commonAttrs,
    tbody: commonAttrs,
    img: new Set(['class', 'style', 'src', 'alt']),
    video: new Set(['class', 'style', 'controls', 'autoPlay', 'buffered', 'crossorigin', 'height', 'loop', 'muted', 'preload', 'poster', 'width', 'playsinline', 'src']),
    source: new Set(['src', 'type']),
    audio: new Set(['class', 'style', 'autoplay', 'buffered', 'controls', 'crossorigin', 'loop', 'muted', 'preload', 'src']),
    track: new Set(['default', 'kind', 'label', 'src', 'srclang']),
    div: commonAttrs,
    span: commonAttrs,
    dl: commonAttrs,
    dt: commonAttrs,
    dd: commonAttrs,
    abbr: commonAttrs,
    details: new Set(['class', 'style', 'open']),
    summary: commonAttrs,
    caption: commonAttrs,
};
const sanitizer = tag => {
    const isCloseTag = tag.startsWith('</');
    if (isCloseTag) {
        const tagName = tag.substring(2, tag.length - 1);
        return allowedTags[tagName] ? tag : strip(tag);
    }
    const indexOfFirstSpace = tag.indexOf(' ');
    const hasAttrs = indexOfFirstSpace > 0;
    const tagName = tag.substring(1, hasAttrs ? (indexOfFirstSpace) : (tag.length - 1));
    const allowedRule = allowedTags[tagName];
    if (!allowedRule) {
        return strip(tag);
    }
    if (!hasAttrs || !(allowedRule instanceof Set)) {
        return `<${tagName}>`;
    }

    const filterResult = [`<${tagName}`];
    const element = HTMLParser.parse(`${tag}</${tagName}>`);
    const firstChild = element && element.firstChild;
    const attrs = firstChild && firstChild.attributes;
    if (attrs) {
        Object.keys(attrs).forEach(attrName => {
            if (allowedRule.has(attrName)) {
                const attrValue = attrs[attrName];
                const quoteType = attrValue.includes('"') ? '\'' : '"';
                filterResult.push(`${attrName}=${quoteType}${attrValue}${quoteType}`);
            }
        });
    }
    filterResult.push('>');
    return filterResult.join(' ');
};

/**
 * Init markdown helpers
 */
Marked.setOptions({
    renderer,
    breaks: false, //   If true, use GFM hard and soft line breaks. Requires gfm be true.
    gfm: true, // If true, use approved GitHub Flavored Markdown (GFM) specification.
    sanitize: true, // If true, sanitize the HTML passed into markdownString with the sanitizer function.
    sanitizer: Config.ui['chat.markdown.html'] ? sanitizer : null, // A function to sanitize the HTML passed into markdownString.
    headerIds: false,
    smartLists: true, // If true, use smarter list behavior than those found in markdown.pl.
    smartypants: true, // If true, use "smart" typographic punctuation for things like quotes and dashes.
});

export default Marked;
