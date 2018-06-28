import React from 'react';
import Modal from '../../components/modal';
import WebViewFrame from './webview-frame';

const show = (sourceUrl, options, callback) => {
    return Modal.show({
        headingClassName: 'dock dock-right',
        actions: false,
        animation: 'enter-from-bottom',
        contentClassName: 'no-padding',
        content: <WebViewFrame src={sourceUrl} options={options} />
    }, callback);
};

export default {
    show,
};
