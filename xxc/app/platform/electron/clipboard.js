import {clipboard, nativeImage} from 'electron';

const writeImageFromUrl = (url, dataType) => {
    if (url.startsWith('file://')) {
        url = url.substr(7);
    }
    const img = dataType === 'base64' ? nativeImage.createFromDataURL(url) : nativeImage.createFromPath(url);
    clipboard.writeImage(img);
};

const getImageData = nativeImg => {
    if (nativeImg && !nativeImg.isEmpty()) {
        const size = nativeImg.getSize();
        const base64 = nativeImg.toDataURL();
        const base64Length = base64.length;
        return {
            name: `clipboard-image-${size.width}x${size.height}.png`,
            type: 'base64',
            base64,
            width: size.width,
            height: size.height,
            size: Math.ceil(((4 * (base64Length / 3))) + (base64Length % 3 !== 0 ? 4 : 0))
        };
    }
    return null;
};

let lastNewImage = getImageData(clipboard.readImage());
const getNewImage = () => {
    const currentImage = getImageData(clipboard.readImage());
    if (!lastNewImage || !currentImage || currentImage.base64 !== lastNewImage.base64) {
        lastNewImage = currentImage;
        return currentImage;
    }
    return null;
};

export default {
    readText: clipboard.readText,
    writeText: clipboard.writeText,
    readImage: clipboard.readImage,
    writeImage: clipboard.writeImage,
    readHTML: clipboard.readHTML,
    writeHTML: clipboard.writeHTML,
    write: clipboard.write,
    writeImageFromUrl,
    getNewImage,
};
