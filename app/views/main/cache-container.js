import React, {Component} from 'react';
import ROUTES from '../common/routes';
import {Index as ChatsView} from '../chats';
import {Index as ExtsView} from '../exts';
import replaceViews from '../replace-views';

const mainViews = [
    {path: ROUTES.chats._, view: ChatsView},
    {path: ROUTES.exts._, view: ExtsView},
];

class CacheContainer extends Component {
    static get CacheContainer() {
        return replaceViews('main/cache-container', CacheContainer);
    }

    render() {
        let {
            match,
            history,
            location,
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
