import React, {Component, PropTypes} from 'react';
import {Route, Redirect} from 'react-router-dom';
import HTML from '../../utils/html-helper';
import App from '../../core';
import {Menu} from './menu';
import {ChatsCache} from './chats-cache';
import {ChatsDndContainer} from './chats-dnd-container';
import replaceViews from '../replace-views';

class Index extends Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        hidden: PropTypes.bool,
        className: PropTypes.string,
    };

    static defaultProps = {
        hidden: false,
        className: null,
    };

    static get Index() {
        return replaceViews('chats/index', Index);
    }

    render() {
        const {
            hidden,
            className,
            match
        } = this.props;

        App.im.ui.activeChat(match.params.id);

        return (<div className={HTML.classes('dock app-chats', className, {hidden})}>
            <Menu className="dock-left" filter={match.params.filterType} />
            <ChatsCache className="dock-right" filterType={match.params.filterType} chatId={match.params.id}>
                <ChatsDndContainer className="dock" />
            </ChatsCache>
            <Route
                path="/chats/:filterType"
                exact
                render={props => {
                    const activeChatId = App.im.ui.currentActiveChatId;
                    if (activeChatId) {
                        return <Redirect to={`${props.match.url}/${activeChatId}`} />;
                    }
                    return null;
                }}
            />
        </div>);
    }
}

export default Index;
