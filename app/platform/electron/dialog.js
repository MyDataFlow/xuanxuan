import {remote as Remote} from 'electron';
import fs from 'fs-extra';
import env from './env';
import Path from 'path';
import Lang from '../../lang';
import ui from './ui';
import openFileButton from '../common/open-file-button';

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
        title: Lang.string('dialog.fileSaveTo'),
        defaultPath: Path.join(lastFileSavePath || env.desktopPath, filename)
    }, options);
    Remote.dialog.showSaveDialog(ui.browserWindow, options, filename => {
        if(filename) {
            lastFileSavePath = filename;
        }
        callback && callback(filename);
    });
};

/**
 * Show open dialog
 */
const showRemoteOpenDialog = (options, callback) => {
    options = Object.assign({
        title: Lang.string('dialog.openFile'),
        defaultPath: env.desktopPath,
        properties: ['openFile']
    }, options);
    Remote.dialog.showOpenDialog(ui.browserWindow, options, callback);
};

export default {
    showRemoteOpenDialog,
    showSaveDialog,
    showOpenDialog: openFileButton.showOpenDialog
};
