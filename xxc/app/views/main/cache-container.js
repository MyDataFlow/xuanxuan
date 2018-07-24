import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ExtsView from 'ExtsView';
import ROUTES from '../common/routes';
import {Index as ChatsView} from '../chats';
import replaceViews from '../replace-views';

const mainViews = [
    {path: ROUTES.chats._, view: ChatsView},
];
mainViews.push({path: ROUTES.exts._, view: ExtsView});

class CacheContainer extends Component {
    static get CacheContainer() {
        return replaceViews('main/cache-container', CacheContainer);
    }

    static propTypes = {
        match: PropTypes.any,
        location: PropTypes.any,
        history: PropTypes.any,
        staticContext: PropTypes.any
    };

    static defaultProps = {
        match: null,
        location: null,
        history: PropTypes.any,
        staticContext: PropTypes.any
    };

    render() {
        const {
            match,
            location,
            history,
            staticContext,
            ...other
        } = this.props;

        return (<div className="app-main-container dock" {...other}>
            {
                mainViews.map(item => {
                    const isMatch = match.url.startsWith(item.path);
                    if (isMatch) {
                        item.active = true;
                        return <item.view key={item.path} match={match} />;
                    } else if (item.active) {
                        return <item.view key={item.path} match={match} hidden />;
                    }
                    return null;
                })
            }
        </div>);
    }
}

export default CacheContainer;
