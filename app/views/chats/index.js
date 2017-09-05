import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Config from 'Config';
import ROUTES from '../common/routes';
import Menu from './menu';

class IndexView extends Component {

    render() {
        const {
            match
        } = this.props;

        console.log('Chat.IndexView', this.props);

        const menuWidth = HTML.rem(Config.ui['menu.width']);

        return <div className="dock app-chats">
            <Menu className="dock-left" filter={match.params.filterType} style={{width: menuWidth}}/>
        </div>;
    }
}

export default IndexView;
