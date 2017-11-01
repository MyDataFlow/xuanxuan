import {nativeImage} from 'electron';
import fs from 'fs-extra';
import Path from 'path';

const base64ToBuffer = base64Str => {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches.length !== 3) {
        throw new Error('Invalid base64 image string.');
    }
    return new Buffer(matches[2], 'base64');
};

const cutImage = (imagePath, select) => {
    return new Promise((resolve, reject) => {
        let img = document.createElement('img');
        let canvas = document.createElement('canvas');
        canvas.width = select.width;
        canvas.height = select.height;

        img.onload = () => {
            let display = canvas.getContext('2d');
            display.drawImage(img, select.x, select.y, select.width, select.height, 0, 0, select.width, select.height);
            resolve({width: select.width, height: select.height, type: 'png', data: canvas.toDataURL('image/png')});
            img = canvas = display = null;
        };

        img.onerror = () => {
            reject(new Error('Cant not get user media.'));
            img = canvas = null;
        };

        if (!imagePath.startsWith('https://') && !imagePath.startsWith('http://') && !imagePath.startsWith('file://')) {
            imagePath = `file://${imagePath}`;
        }
        img.src = imagePath;
    });
};

const createFromPath = path => {
    return nativeImage.createFromPath(path);
};

const createFromDataURL = dataUrl => {
    return nativeImage.createFromDataURL(dataUrl);
};

const saveImage = (image, filePath) => {
    const file = {
        path: filePath,
        name: Path.basename(filePath),
    };
    if (typeof image === 'string') {
        file.base64 = image;
        image = base64ToBuffer(image);
        file.size = image.length;
    } else if (image.toPNG) {
        image = image.toPNG();
        file.size = image.length;
    }
    if (image instanceof Buffer) {
        return fs.outputFile(filePath, image).then(() => {
            return Promise.resolve(file);
        });
    }
    return Promise.reject('Cannot convert image to a buffer.');
};

export default {
    base64ToBuffer,
    cutImage,
    saveImage,
    createFromPath,
    createFromDataURL
};
