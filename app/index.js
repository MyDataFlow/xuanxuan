import './style/app.less';
import './utils/debug';
import React from 'react';
import ReactDOM from 'react-dom';
import IndexView from './views/index';
import Platform from 'Platform';

const appElement = document.getElementById('appContainer');
ReactDOM.render(<IndexView/>, appElement, () => {
    const loadingElement = document.getElementById('loading');
    loadingElement.parentNode.removeChild(loadingElement);
});

document.body.classList.add(`os-${Platform.env.os}`);

document.addEventListener('click', e => {
    let target = e.target;
    while(target && target.tagName !== 'A') {
        target = target.parentNode;
    }
    if(target && target.tagName === 'A' && target.attributes['href']) {
        const link = target.attributes['href'].value;
        if(link.startsWith('http://') || link.startsWith('https://')) {
            Platform.ui.openExternal(link);
            e.preventDefault();
        }
    }
});
