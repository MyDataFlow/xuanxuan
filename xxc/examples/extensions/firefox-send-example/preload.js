const onDocumentReady = fn => {
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};

onDocumentReady(() => {
    // alert(document.title);
});
