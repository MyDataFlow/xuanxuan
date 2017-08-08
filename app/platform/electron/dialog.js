import {remote as Remote} from 'electron';
import fs from 'fs-extra';
import env from './env';
import Path from 'path';

let lastFileSavePath = '';

/**
 * Show save dialog
 * @param object   options
 */
const showSaveDialog = (options, callback) => {
    if(options.sourceFilePath) {
        let sourceFilePath = options.sourceFilePath;
        delete options.sourceFilePath;
        return showSaveDialog(options, filename => {
            if(filename) {
                fs.copy(sourceFilePath, filename)
                    .then(() => {
                        callback && callback(filename);
                    }).catch(callback);
            } else {
                callback && callback();
            }
        });
    }

    let filename = options.fileName || '';
    delete options.fileName;

    options = Object.assign({
        title: Lang.dialog.fileSaveTo,
        defaultPath: Path.join(lastFileSavePath || env.desktopPath, filename)
    }, options);
    Remote.dialog.showSaveDialog(this.browserWindow, options, filename => {
        if(filename) {
            lastFileSavePath = filename;
        }
        callback && callback(filename);
    });
};

/**
 * Show open dialog
 */
const showOpenDialog = (options, callback) => {
    options = Object.assign({
        title: Lang.dialog.openFile,
        defaultPath: this.desktopPath,
        properties: ['openFile']
    }, options);
    Remote.dialog.showOpenDialog(this.browserWindow, options, callback);
};

export default {
    showSaveDialog,
    showOpenDialog
};
