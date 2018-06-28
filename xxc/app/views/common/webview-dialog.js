import React from 'react';
import Modal from '../../components/modal';
import WebViewFrame from './webview-frame';
import timeSequence from '../../utils/time-sequence';

const show = (sourceUrl, options, callback) => {
    let width = (options && options.width) || 860;
    let height = (options && options.height) || 640;
    if (typeof height === 'number') {
        height = `${height}px`;
    }
    if (typeof width === 'number') {
        width = `${width}px`;
    }
    const displayId = `display-${timeSequence()}`;
    return Modal.show({
        id: displayId,
        style: {width, height},
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
