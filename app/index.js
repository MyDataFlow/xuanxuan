import React from 'react';
import ReactDOM from 'react-dom';
import './style/app.less';
import './utils/debug';
import IndexView from './views/index';

const appElement = document.getElementById('appContainer');
ReactDOM.render(<IndexView />, appElement, () => {
    const loadingElement = document.getElementById('loading');
    loadingElement.parentNode.removeChild(loadingElement);
});
