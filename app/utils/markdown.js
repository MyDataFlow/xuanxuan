import Marked from 'marked';
import HighlightJS from 'highlight.js';

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
    return `<pre${fileName ? (` data-name="${fileName}"`) : ''}><code data-lang="${lang || ''}" class="lang-${result.language}">${result.value}</code></pre>`;
};

/**
 * Init markdown helpers
 */
Marked.setOptions({
    renderer,
    gfm: true,
    sanitize: true,
});

export default Marked;
