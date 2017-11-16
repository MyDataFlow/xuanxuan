import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import {MenuHeader} from './menu-header';
import {MenuList} from './menu-list';
import replaceViews from '../replace-views';

class Menu extends Component {
    static propTypes = {
        className: PropTypes.string,
        filter: PropTypes.string,
        children: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        filter: null,
        children: null,
    };

    static get Menu() {
        return replaceViews('chats/menu', Menu);
    }

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
        const {
            filter,
            className,
            children,
            ...other
        } = this.props;

        return (<div className={HTML.classes('app-chats-menu primary-pale', className)} {...other}>
            <MenuHeader
                filter={filter}
                defaultSearch={this.defaultSearch}
                onSearchChange={this.handleSearchChange}
                className="dock-top"
            />
            <MenuList search={this.state.search} filter={filter} className="dock-bottom" />
            {children}
        </div>);
    }
}

export default Menu;
