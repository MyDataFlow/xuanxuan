import {clipboard} from 'electron';

const saveImage = image => {
    clipboard.saveImage(image);
}

export default {
    readImage: clipboard.readImage,
    saveImage,
};
