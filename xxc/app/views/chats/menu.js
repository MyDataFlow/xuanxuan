import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes, getSearchParam} from '../../utils/html-helper';
import {MenuHeader} from './menu-header';
import {MenuList} from './menu-list';
import replaceViews from '../replace-views';
import App from '../../core';

class Menu extends Component {
    static get Menu() {
        return replaceViews('chats/menu', Menu);
    }

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

    constructor(props) {
        super(props);
        this.defaultSearch = getSearchParam('search');
        this.state = {
            search: this.defaultSearch,
            searchFocus: false
        };
    }

    handleSearchChange = search => {
        this.setState({search});
    };

    handleSearchFocusChange = searchFocus => {
        if (this.blurSearchTimer) {
            clearTimeout(this.blurSearchTimer);
        }
        if (searchFocus) {
            this.setState({searchFocus});
        } else {
            this.blurSearchTimer = setTimeout(() => {
                this.setState({searchFocus: false});
                this.blurSearchTimer = null;
            }, 200);
        }
    };

    onRequestClearSearch = () => {
        this.menuHeader.clearSearch();
    };

    render() {
        const {
            filter,
            className,
            children,
            ...other
        } = this.props;

        return (<div className={classes('app-chats-menu primary-pale', className)} {...other}>
            <MenuHeader
                ref={e => {this.menuHeader = e;}}
                filter={filter}
                defaultSearch={this.defaultSearch}
                onSearchChange={this.handleSearchChange}
                onSearchFocus={this.handleSearchFocusChange}
                className="dock-top"
            />
            <MenuList onRequestClearSearch={this.onRequestClearSearch} search={this.state.searchFocus ? this.state.search : ''} filter={filter} className="dock-bottom" />
            {children}
        </div>);
    }
}

export default Menu;
