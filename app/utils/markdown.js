import Marked       from 'marked';
import HighlightJS  from 'highlight.js';

/**
 * Init markdown helpers
 */
Marked.setOptions({
    highlight: code => {
        return HighlightJS.highlightAuto(code).value;
    },
    gfm: true,
    sanitize: true
});


export default Marked;
