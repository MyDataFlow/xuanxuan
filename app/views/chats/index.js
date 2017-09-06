import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Config from 'Config';
import Menu from './menu';
import ChatsCacheView from './chats-cache';
import App from '../../core';
import {Route, Redirect} from 'react-router-dom';

class IndexView extends Component {

    render() {
        const {
            match
        } = this.props;

        App.im.ui.activeChat(match.params.id);

        const menuWidth = HTML.rem(Config.ui['menu.width']);

        return <div className="dock app-chats">
            <Menu className="dock-left" filter={match.params.filterType} style={{width: menuWidth}}/>
            <ChatsCacheView style={{left: menuWidth}} className="dock-right" filterType={match.params.filterType} chatId={match.params.id}/>
            <Route path="/chats/:filterType" exact render={props => {
                const activeChatId = App.im.ui.currentActiveChatId;
                if(activeChatId) {
                    return <Redirect to={`${props.match.url}/${activeChatId}`}/>
                } else {
                    return null;
                }
            }}/>
        </div>;
    }
}

export default IndexView;
