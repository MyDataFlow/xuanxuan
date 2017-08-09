import './style/less/app.less';
import './utils/debug';
import App                    from 'App';
import React                  from 'react';
import ReactDOM               from 'react-dom';
import injectTapEventPlugin   from 'react-tap-event-plugin';
import {ThemeProvider}        from 'Theme';
import AppContainer           from 'Views/app-container';

injectTapEventPlugin();

let appElement = document.getElementById('appContainer');
ReactDOM.render(<ThemeProvider><AppContainer /></ThemeProvider>, appElement);

let loadingElement = document.getElementById('loading');
loadingElement.parentNode.removeChild(loadingElement);
