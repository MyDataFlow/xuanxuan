import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'react-router-dom';
import {classes} from '../../utils/html-helper';
import ROUTES from '../common/routes';
import App from '../../core';
import {Navbar} from './navbar';
import {GlobalMessage} from './global-message';
import {CacheContainer} from './cache-container';
import replaceViews from '../replace-views';

class Index extends Component {
    static get Index() {
        return replaceViews('main/index', Index);
    }

    static propTypes = {
        className: PropTypes.string,
        userStatus: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        userStatus: null,
    };

    componentDidMount() {
        this.onUserConfigChange = App.profile.onUserConfigChange(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        App.events.off(this.onUserConfigChange);
    }

    render() {
        const {
            className,
            userStatus,
            ...other
        } = this.props;

        return (<div className={classes('app-main', className)} {...other}>
            <GlobalMessage className="dock-top" />
            <Navbar userStatus={userStatus} className="dock-left primary shadow-2" />
            <Route path={ROUTES.apps.__} exact component={CacheContainer} />
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
        </div>);
    }
}

export default Index;
