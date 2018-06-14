import React from 'react';
import ReactDOM from 'react-dom';
import './style/app.less';
import './utils/debug';
import './utils/react-debug';
import IndexView from './views/index';
import appRuntime from './core/runtime';
import {triggerReady} from './core/ui';

appRuntime.ready(() => {
    const appElement = document.getElementById('appContainer');
    ReactDOM.render(<IndexView />, appElement, () => {
        const loadingElement = document.getElementById('loading');
        loadingElement.parentNode.removeChild(loadingElement);
        triggerReady();
    });
});
