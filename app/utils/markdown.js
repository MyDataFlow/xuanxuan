import Marked       from 'marked';
import HighlightJS  from 'highlight.js';

/**
 * Init markdown helpers
 */
Marked.setOptions({
    highlight: (code, lang) => {
        const result = HighlightJS.highlightAuto(code, lang ? [lang] : undefined);
        HighlightJS
        return result.value;
    },
    gfm: true,
    sanitize: true
});


export default Marked;
