import React, {PureComponent} from 'react';
import App from '../../core';
import {Index as LoginView} from '../login';
import {Index as MainView} from '../main';
import replaceViews from '../replace-views';

class AppView extends PureComponent {
    static get AppView() {
        return replaceViews('index/app-view', AppView);
    }

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
        return (<div
            className="affix"
            style={{
                transition: 'transform .4s',
                transform: `translateX(${App.profile.isUserVertified ? '0' : '100%'})`
            }}
        >
            <LoginView
                userStatus={this.state.userStatus}
                className="dock-left"
                style={{
                    width: '100%',
                    left: '-100%',
                }}
            />
            <MainView userStatus={this.state.userStatus} className="dock" />
        </div>);
    }
}

export default AppView;
