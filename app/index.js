import React from 'react';
import ReactDOM from 'react-dom';
import './style/app.less';
import './utils/debug';
import IndexView from './views/index';
import appRuntime from './core/runtime';

appRuntime.ready(() => {
    const appElement = document.getElementById('appContainer');
    ReactDOM.render(<IndexView />, appElement, () => {
        const loadingElement = document.getElementById('loading');
        loadingElement.parentNode.removeChild(loadingElement);
    });
});
