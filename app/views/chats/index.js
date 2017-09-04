import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Config from 'Config';
import ROUTES from '../common/routes';
import Menu from './menu';

class IndexView extends Component {

    render() {
        const menuWidth = HTML.rem(Config.ui['menu.width']);

        console.log('chats index', this.props);

        return <div className="dock">
            <Menu className="dock-left" style={{width: menuWidth}}/>
        </div>;
    }
}

export default IndexView;
