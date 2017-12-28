import React, {Component, PropTypes} from 'react';
import hotkeys from 'hotkeys-js';
import HTML from '../../utils/html-helper';
import timeSequence from '../../utils/time-sequence';
import App from '../../core';
import ContextMenu from '../../components/context-menu';
import {ChatListItem} from './chat-list-item';
import replaceViews from '../replace-views';
import ROUTES from '../common/routes';

export default class MenuSearchList extends Component {
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

    static get MenuSearchList() {
        return replaceViews('chats/menu-search-list', MenuSearchList);
    }

    constructor(props) {
        super(props);
        this.state = {
            select: '',
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

    handleItemContextMenu = (chat, e) => {
        const menuItems = App.im.ui.createChatContextMenuItems(chat, this.props.filter, '');
        if (menuItems && menuItems.length) {
            ContextMenu.show({x: e.pageX, y: e.pageY}, menuItems);
            e.preventDefault();
        }
    };

    render() {
        const {
            search,
            filter,
            className,
            children,
            onRequestClearSearch,
            ...other
        } = this.props;

        const chats = App.im.chats.search(search, filter);
        let {select} = this.state;
        if (!select && chats.length) {
            select = chats[0];
        }
        this.select = select;
        this.chats = chats;

        return (<div className={HTML.classes('app-chats-menu-list list scroll-y', className)} {...other}>
            {
                chats.map((chat, idx) => {
                    const isSelected = select && chat.gid === select.gid;
                    if (isSelected) {
                        this.selectIndex = idx;
                    }
                    return (<ChatListItem
                        onMouseEnter={() => this.setState({select: chat})}
                        onContextMenu={this.handleItemContextMenu.bind(this, chat)}
                        key={chat.gid}
                        filterType={filter}
                        chat={chat}
                        className={HTML.classes('item', {hover: isSelected})}
                    />);
                })
            }
            {children}
        </div>);
    }
}
