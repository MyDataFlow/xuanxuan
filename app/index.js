import './style/app.less';
import './utils/debug';
import React from 'react';
import ReactDOM from 'react-dom';
import IndexView from './views/index';
import Platform from 'Platform';
import App from './core';

const appElement = document.getElementById('appContainer');
ReactDOM.render(<IndexView/>, appElement, () => {
    const loadingElement = document.getElementById('loading');
    loadingElement.parentNode.removeChild(loadingElement);
});

document.body.classList.add(`os-${Platform.env.os}`);

document.addEventListener('click', e => {
    let target = e.target;
    while(target && !((target.classList && target.classList.contains('app-link')) || (target.tagName === 'A' && target.attributes['href']))) {
        target = target.parentNode;
    }

    if(target && (target.tagName === 'A' || target.classList.contains('app-link')) && (target.attributes['href'] || target.attributes['data-url'])) {
        const link = (target.attributes['data-url'] || target.attributes['href']).value;
        if(link.startsWith('http://') || link.startsWith('https://')) {
            Platform.ui.openExternal(link);
            e.preventDefault();
        } else if(link.startsWith('@')) {
            const params = link.substr(1).split('/');
            App.ui.emitAppLinkClick(params[0], params[1]);
            e.preventDefault();
        }
    }
});
