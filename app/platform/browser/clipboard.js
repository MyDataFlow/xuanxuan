import clipboard from 'clipboard-js';

const saveImage = image => {
    // clipboard.saveImage(image);
};

const writeText = text => {
    clipboard.copy(text);
};

const writeHTML = html => {
    clipboard.copy({'text/html': html});
};

export default {
    writeText: writeText,
    // readText: clipboard.readText,
    writeHTML: writeHTML,
    // readHTML: clipboard.readHTML,
    // readImage: clipboard.readImage,
    // saveImage,
};
