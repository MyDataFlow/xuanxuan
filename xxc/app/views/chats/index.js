import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Config from 'Config';
import {Route, Redirect} from 'react-router-dom';
import SplitPane from 'react-split-pane';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import {Menu} from './menu';
import {ChatsCache} from './chats-cache';
import {ChatsDndContainer} from './chats-dnd-container';
import {ChatsSuggestPanel} from './chats-suggest-panel';
import replaceViews from '../replace-views';

export default class Index extends Component {
    static get Index() {
        return replaceViews('chats/index', Index);
    }

    static propTypes = {
        match: PropTypes.object.isRequired,
        hidden: PropTypes.bool,
        className: PropTypes.string,
    };

    static defaultProps = {
        hidden: false,
        className: null,
    };

    handChatsCacheClick = () => {
        App.ui.showMobileChatsMenu(false);
    };

    render() {
        const {
            hidden,
            className,
            match
        } = this.props;

        App.im.ui.activeChat(match.params.id);

        return (<div className={classes('dock app-chats', className, {hidden})}>
            <SplitPane split="vertical" maxSize={400} minSize={200} defaultSize={200} paneStyle={{userSelect: 'none'}}>
                <Menu className="dock" filter={match.params.filterType} />
                <ChatsCache onClick={this.handChatsCacheClick} className="dock" filterType={match.params.filterType} chatId={match.params.id}>
                    <ChatsDndContainer className="dock" />
                </ChatsCache>
            </SplitPane>
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
            <ChatsSuggestPanel />
        </div>);
    }
}
