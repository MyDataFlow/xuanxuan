const getImageSize = (imagePath) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({width: img.width, height: img.height});
        };
        img.onerror = () => {
            reject();
        };
        img.src = imagePath;
    });
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

export default {
    getImageSize,
    cutImage,
};
