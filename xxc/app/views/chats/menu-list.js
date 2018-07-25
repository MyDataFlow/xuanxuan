import React, {Component} from 'react';
import PropTypes from 'prop-types';
import App from '../../core';
import {showContextMenu} from '../../core/context-menu';
import {MenuContactList} from './menu-contact-list';
import {MenuGroupList} from './menu-group-list';
import {MenuSearchList} from './menu-search-list';
import {MenuRecentList} from './menu-recent-list';
import replaceViews from '../replace-views';

class MenuList extends Component {
    static get MenuList() {
        return replaceViews('chats/menu-list', MenuList);
    }

    static propTypes = {
        className: PropTypes.string,
        search: PropTypes.string,
        filter: PropTypes.string,
        children: PropTypes.any,
        onRequestClearSearch: PropTypes.func,
    };

    static defaultProps = {
        className: null,
        search: null,
        filter: null,
        children: null,
        onRequestClearSearch: null,
    };

    componentDidMount() {
        this.dataChangeHandler = App.events.onDataChange(data => {
            let needForceUpdate = false;
            if (this.props.search) {
                needForceUpdate = true;
            } else if (this.props.filter === 'groups' && data.chats && Object.keys(data.chats).some(x => data.chats[x].isGroupOrSystem)) {
                needForceUpdate = true;
            } else if (this.props.filter === 'contacts' && ((data.chats && Object.keys(data.chats).some(x => data.chats[x].isOne2One)) || data.members)) {
                needForceUpdate = true;
            } else if (this.props.filter === 'recents') {
                needForceUpdate = true;
            }
            if (needForceUpdate) {
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        App.events.off(this.dataChangeHandler);
    }

    handleItemContextMenu = (chat, event) => {
        showContextMenu('chat.menu', {
            event,
            chat,
            menuType: this.props.filter,
            viewType: this.props.filter === 'groups' ? 'category' : ''
        });
    };

    render() {
        const {
            search,
            filter,
            onRequestClearSearch,
            className,
            children,
            ...other
        } = this.props;

        if (search) {
            return <MenuSearchList className={className} search={search} onRequestClearSearch={onRequestClearSearch} {...other} />;
        } else if (filter === 'contacts') {
            return <MenuContactList className={className} filter={filter} {...other} />;
        } else if (filter === 'groups') {
            return <MenuGroupList className={className} filter={filter} {...other} />;
        }
        return <MenuRecentList className={className} filter={filter} {...other} />;
    }
}

export default MenuList;
