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
    get isWindowsFocus() {
        return isDocumentHasFocus();
    },
    isWindowOpen: true,
    onWindowFocus,
};
