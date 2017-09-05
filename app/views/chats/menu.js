import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import MenuHeader from './menu-header';
import MenuList from './menu-list';

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
            filter,
            className,
            style,
            children,
            ...other
        } = this.props;

        return <div className={HTML.classes('app-chats-menu primary-pale', className)} style={style} {...other}>
            <MenuHeader
                filter={filter}
                defaultSearch={this.defaultSearch}
                onSearchChange={this.handleSearchChange} className="dock-top"
            />
            <MenuList search={this.state.search} filter={filter} className="dock-bottom"/>
        </div>;
    }
}

export default Menu;
