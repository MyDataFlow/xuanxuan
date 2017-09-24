import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Navbar from './navbar';
import Config from 'Config';
import {
    HashRouter as Router,
    Route,
    Link,
    Redirect,
    withRouter
} from 'react-router-dom';
import ChatsView from '../chats';
import ROUTES from '../common/routes';
import App from '../../core';

const mainViews = [
    {path: ROUTES.chats.__, view: ChatsView},
];

class MainView extends Component {

    componentDidMount() {
        this.onUserConfigChange = App.profile.onUserConfigChange(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        App.events.off(this.onUserConfigChange);
    }

    render() {
        let {
            className,
            children,
            userStatus,
            ...other
        } = this.props;

        return <div className={HTML.classes('app-main', className)} {...other}>
            <Navbar className="dock-left primary" style={{width: HTML.rem(Config.ui['navbar.width'])}}/>
            {children}
            <div className="app-main-container dock" style={{left: HTML.rem(Config.ui['navbar.width'])}}>
            {
                mainViews.map(item => {
                    return <Route key={item.path} path={item.path} component={item.view}/>
                })
            }
            <Route path="/:app?" exact render={(props) => {
                if(props.match.url === '/' || props.match.url === '/index' || props.match.url === '/chats') {
                    const activeChatId = App.im.ui.currentActiveChatId;
                    if(activeChatId) {
                        return <Redirect to={`/chats/recents/${activeChatId}`}/>
                    } else {
                        return <Redirect to='/chats/recents'/>;
                    }
                } else {
                    return  null;
                }
            }}/>
            </div>
        </div>;
    }
}

export default MainView;
