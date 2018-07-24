import React, {Component} from 'react';
import PropTypes from 'prop-types';
import hotkeys from 'hotkeys-js';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import {showContextMenu} from '../../core/context-menu';
import {ChatListItem} from './chat-list-item';
import replaceViews from '../replace-views';
import ROUTES from '../common/routes';
import ListItem from '../../components/list-item';
import Lang from '../../lang';

export default class MenuSearchList extends Component {
    static get MenuSearchList() {
        return replaceViews('chats/menu-search-list', MenuSearchList);
    }

    static propTypes = {
        className: PropTypes.string,
        search: PropTypes.string,
        filter: PropTypes.string,
        children: PropTypes.any,
        onRequestClearSearch: PropTypes.func,
        startPageSize: PropTypes.number,
        morePageSize: PropTypes.number,
        defaultPage: PropTypes.number
    };

    static defaultProps = {
        className: null,
        search: null,
        filter: null,
        children: null,
        onRequestClearSearch: null,
        startPageSize: 20,
        morePageSize: 10,
        defaultPage: 1
    };

    constructor(props) {
        super(props);
        this.state = {
            select: '',
            page: props.defaultPage
        };
    }

    componentDidMount() {
        hotkeys('up', 'chatsMenuSearch', e => {
            const {chats, selectIndex} = this;
            const length = chats.length;
            if (length > 1) {
                this.setState({select: chats[((selectIndex - 1) + length) % length]});
            } else if (length) {
                this.setState({select: chats[0]});
            }
            e.preventDefault();
        });
        hotkeys('down', 'chatsMenuSearch', e => {
            const {chats, selectIndex} = this;
            const length = chats.length;
            if (length > 1) {
                this.setState({select: chats[((selectIndex + 1) + length) % length]});
            } else if (length) {
                this.setState({select: chats[0]});
            }
            e.preventDefault();
        });
        hotkeys('enter', 'chatsMenuSearch', e => {
            const {select} = this;
            if (this.props.onRequestClearSearch && select) {
                window.location.hash = `#${ROUTES.chats.chat.id(select.gid, this.props.filter)}`;
                this.props.onRequestClearSearch();
            }
            e.preventDefault();
        });
        hotkeys('esc', 'chatsMenuSearch', e => {
            if (this.props.onRequestClearSearch) {
                this.props.onRequestClearSearch();
            }
            e.preventDefault();
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.search !== this.props.search) {
            this.setState({select: ''});
        }
    }

    componentWillUnmount() {
        hotkeys.deleteScope('chatsMenuSearch');
    }

    handleItemContextMenu = event => {
        const chat = App.im.chats.get(event.currentTarget.attributes['data-gid'].value);
        showContextMenu('chat.menu', {
            event,
            chat,
            menuType: this.props.filter,
            viewType: ''
        });
    };

    render() {
        const {
            search,
            filter,
            className,
            children,
            onRequestClearSearch,
            startPageSize,
            morePageSize,
            defaultPage,
            ...other
        } = this.props;

        const chats = App.im.chats.search(search, filter);
        let {select} = this.state;
        if (!select && chats.length) {
            select = chats[0];
        }
        this.select = select;
        this.chats = chats;

        const list = chats;
        const listViews = [];
        const {page} = this.state;
        const maxIndex = page ? Math.min(list.length, startPageSize + (page > 1 ? (page - 1) * morePageSize : 0)) : list.length;
        for (let i = 0; i < maxIndex; i += 1) {
            const chat = list[i];
            const isSelected = select && chat.gid === select.gid;
            if (isSelected) {
                this.selectIndex = i;
            }
            listViews.push(<ChatListItem
                onMouseEnter={() => this.setState({select: chat})}
                onContextMenu={this.handleItemContextMenu.bind(this, chat)}
                key={chat.gid}
                data-gid={chat.gid}
                filterType={filter}
                chat={chat}
                className={classes('item', {hover: isSelected})}
            />);
        }
        const notShowCount = list.length - maxIndex;
        if (notShowCount) {
            listViews.push(<ListItem key="showMore" icon="chevron-double-down" className="flex-middle item muted" title={<span className="title small">{Lang.format('common.clickShowMoreFormat', notShowCount)}</span>} onClick={this.handleRequestMorePage} />);
        }

        return (<div className={classes('app-chats-menu-list list scroll-y', className)} {...other}>
            {listViews}
            {children}
        </div>);
    }
}
