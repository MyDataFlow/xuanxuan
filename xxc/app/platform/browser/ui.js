const openExternal = link => {
    window.open(link);
};

const isDocumentHasFocus = () => {
    return window.document.hasFocus();
};

const onWindowFocus = listener => {
    document.addEventListener('focus', listener);
};

export default {
    openExternal,
    get isWindowOpenAndFocus() {
        return isDocumentHasFocus();
    },
    get isWindowFocus() {
        return isDocumentHasFocus();
    },
    isWindowOpen: true,
    onWindowFocus,
};
