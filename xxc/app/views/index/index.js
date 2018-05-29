import React, {PureComponent} from 'react';
import {HashRouter as Router, Route, Switch} from 'react-router-dom';
import ImageCutterApp from './app-image-cutter';
import {AppView} from './app-view';
import replaceViews from '../replace-views';

class Index extends PureComponent {
    static get Index() {
        return replaceViews('index/index', Index);
    }

    render() {
        return (<Router>
            <Switch>
                <Route path="/image-cutter/:file?" component={ImageCutterApp} />
                <Route path="/:app?" component={AppView} />
            </Switch>
        </Router>);
    }
}

export default Index;
