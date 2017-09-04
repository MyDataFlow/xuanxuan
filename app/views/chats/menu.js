import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import MenuHeader from './menu-header';
import MenuList from './menu-list';
import ROUTES from '../common/routes';
import {Route} from 'react-router-dom';

class Menu extends Component {

    constructor(props) {
        super(props);
        this.defaultSearch = HTML.getSearchParam('search');
        this.state = {
            search: this.defaultSearch
        };
    }

    handleSearchChange = (search) => {
        this.setState({search});
    }

    render() {
        let {
            className,
            style,
            children,
            ...other
        } = this.props;

        return <div className={HTML.classes('app-chats-menu primary-pale', className)} style={style} {...other}>
            <MenuHeader
                defaultSearch={this.defaultSearch}
                onSearchChange={this.handleSearchChange} className="dock-top"
            />
            <Route path={ROUTES.chats.recents.__} render={() => <MenuList search={this.state.search} filter="recents" className="dock-bottom"/>}/>
            <Route path={ROUTES.chats.contacts.__} render={() => <MenuList search={this.state.search} filter="contacts" className="dock-bottom"/>}/>
            <Route path={ROUTES.chats.groups.__} render={() => <MenuList search={this.state.search} filter="groups" className="dock-bottom"/>}/>
        </div>;
    }
}

export default Menu;
