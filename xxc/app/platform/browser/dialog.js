import openFileButton from '../common/open-file-button';

/**
 * Show save dialog
 * @param object   options
 */
const showSaveDialog = (options, callback) => {
    if (options.fileUrl) {
        window.open(options.fileUrl);
        callback(true);
    } else {
        if (DEBUG) {
            console.warn('Cannot save file without file url defenition');
        }
        callback(false);
    }
};

export default {
    showSaveDialog,
    showOpenDialog: openFileButton.showOpenDialog
};
