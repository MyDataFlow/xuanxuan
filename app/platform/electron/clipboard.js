import {clipboard} from 'electron';

const saveImage = image => {
    clipboard.saveImage(image);
}

export default {
    writeText: clipboard.writeText,
    readText: clipboard.readText,
    writeHTML: clipboard.writeHTML,
    readHTML: clipboard.readHTML,
    readImage: clipboard.readImage,
    saveImage,
};
