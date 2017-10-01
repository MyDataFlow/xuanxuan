import {clipboard, nativeImage} from 'electron';

const writeImageFromUrl = (url, dataType) => {
    const img = dataType === 'base64' ? nativeImage.createFromDataURL(url) : nativeImage.createFromPath(url);
    clipboard.writeImage(img);
};

export default {
    readText: clipboard.readText,
    writeText: clipboard.writeText,
    readImage: clipboard.readImage,
    writeImage: clipboard.writeImage,
    writeImageFromUrl,
};
