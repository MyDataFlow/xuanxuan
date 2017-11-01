import React, {Component} from 'react';
import {HashRouter as Router, Route, Switch} from 'react-router-dom';
import AppView from './app';
import ImageCutterApp from './app-image-cutter';

class IndexView extends Component {
    render() {
        return (<Router>
            <Switch>
                <Route path="/image-cutter/:file?" component={ImageCutterApp} />
                <Route path="/:app?" component={AppView} />
            </Switch>
        </Router>);
    }
}

export default IndexView;
