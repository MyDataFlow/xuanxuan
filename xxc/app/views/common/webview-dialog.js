import React from 'react';
import Modal from '../../components/modal';
import WebViewFrame from './webview-frame';
import timeSequence from '../../utils/time-sequence';

const show = (sourceUrl, options, callback) => {
    let width = (options && options.width);
    let height = (options && options.height);
    if (options && options.size) {
        if (options.size === 'lg') {
            width = width || (window.innerWidth - 40);
            height = height || (window.innerHeight - 40);
        } else if (options.size === 'full') {
            width = width || '100%';
            height = height || '100%';
        }
    }
    if (typeof height === 'number') {
        height = `${height}px`;
    }
    if (typeof width === 'number') {
        width = `${width}px`;
    }
    const displayId = `display-${timeSequence()}`;
    return Modal.show({
        id: displayId,
        style: {width: width || 860, height: height || 640},
        headingClassName: 'dock dock-right dock-top',
        actions: false,
        animation: 'enter-from-bottom fade',
        contentClassName: 'no-padding flex stretch',
        content: <WebViewFrame displayId={displayId} src={sourceUrl} options={options} />
    }, callback);
};

export default {
    show,
};
