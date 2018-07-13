import Marked from 'marked';
import HighlightJS from 'highlight.js';
import Lang from '../lang';

const renderer = new Marked.Renderer();

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

/**
 * Init markdown helpers
 */
Marked.setOptions({
    renderer,
    breaks: true, // If true, use GFM hard and soft line breaks. Requires gfm be true.
    gfm: true, // If true, use approved GitHub Flavored Markdown (GFM) specification.
    sanitize: false, // If true, sanitize the HTML passed into markdownString with the sanitizer function.
    headerIds: false,
    smartLists: true, // If true, use smarter list behavior than those found in markdown.pl.
    smartypants: true, // If true, use "smart" typographic punctuation for things like quotes and dashes.
});

export default Marked;
