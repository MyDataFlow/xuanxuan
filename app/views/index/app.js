import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import App from '../../core';
import LoginView from '../login';
import MainView from '../main';

class AppView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            userStatus: App.profile.userStatus
        };
    }

    componentDidMount() {
        this.onUserStatusChangeHandler = App.profile.onUserStatusChange(user => {
            this.setState({userStatus: App.profile.userStatus});
        });
    }

    componentWillUnmount() {
        App.events.off(this.onUserStatusChangeHandler);
    }

    render() {
        return <div className="affix" style={{
            transition: 'transform .4s',
            transform: `translateX(${App.profile.isUserOnline ? '0' : '100%'})`
        }}>
            <LoginView userStatus={this.state.userStatus} className="dock-left" style={{
                width: '100%',
                left: '-100%',
            }}/>
            <MainView userStatus={this.state.userStatus} className="dock"/>
        </div>
    }
}

export default AppView;
