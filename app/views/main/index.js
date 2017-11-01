import React, {Component, PropTypes} from 'react';
import {Route, Redirect} from 'react-router-dom';
import Config from 'Config';
import HTML from '../../utils/html-helper';
import Navbar from './navbar';
import ChatsView from '../chats';
import ROUTES from '../common/routes';
import App from '../../core';
import GlobalMessage from './global-message';

const mainViews = [
    {path: ROUTES.chats.__, view: ChatsView},
];

class MainView extends Component {
    // static defaultProps = {
    //     className: PropTypes.string,
    //     userStatus: PropTypes.any,
    // };

    // static propTypes = {
    //     className: null,
    //     userStatus: null,
    // };

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
            userStatus,
            ...other
        } = this.props;

        return (<div className={HTML.classes('app-main', className)} {...other}>
            <GlobalMessage className="dock-top" />
            <Navbar userStatus={userStatus} className="dock-left primary" style={{width: HTML.rem(Config.ui['navbar.width'])}} />
            <div className="app-main-container dock" style={{left: HTML.rem(Config.ui['navbar.width'])}}>
                {
                    mainViews.map(item => {
                        return <Route key={item.path} path={item.path} component={item.view} />;
                    })
                }
                <Route
                    path="/:app?"
                    exact
                    render={(props) => {
                        if (props.match.url === '/' || props.match.url === '/index' || props.match.url === '/chats') {
                            const activeChatId = App.im.ui.currentActiveChatId;
                            if (activeChatId) {
                                return <Redirect to={`/chats/recents/${activeChatId}`} />;
                            }
                            return <Redirect to="/chats/recents" />;
                        }
                        return null;
                    }}
                />
            </div>
        </div>);
    }
}

export default MainView;
