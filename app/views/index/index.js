import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router, Route} from 'react-router-dom';
import AppView from './app';

class IndexView extends Component {

    render() {
        return <Router>
            <Route path="/:app?" component={AppView}/>
        </Router>
    }
}

export default IndexView;
