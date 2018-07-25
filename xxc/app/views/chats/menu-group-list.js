import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import {showContextMenu} from '../../core/context-menu';
import Icon from '../../components/icon';
import GroupList from '../../components/group-list';
import {ChatListItem} from './chat-list-item';
import replaceViews from '../replace-views';

export default class MenuGroupList extends Component {
    static get MenuGroupList() {
        return replaceViews('chats/menu-group-list', MenuGroupList);
    }

    static propTypes = {
        className: PropTypes.string,
        search: PropTypes.string,
        filter: PropTypes.string,
        children: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        search: null,
        filter: null,
        children: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            dropTarget: null
        };
    }

    handleItemContextMenu(event) {
        const chat = App.im.chats.get(event.currentTarget.attributes['data-gid'].value);
        showContextMenu('chat.menu', {
            event,
            chat,
            menuType: 'groups',
            viewType: 'category'
        });
    }

    checkIsGroup = item => {
        return item.list && item.entityType !== 'Chat';
    };

    itemCreator = chat => {
        return <ChatListItem onContextMenu={this.handleItemContextMenu} data-gid={chat.gid} key={chat.gid} filterType={this.props.filter} chat={chat} className="item" />;
    };

    handleHeadingContextMenu(group, event) {
        showContextMenu('chat.group', {group, event, type: 'group'});
    }

    handleDragOver(group, e) {
        if (!this.state.dropTarget || this.state.dropTarget.id !== group.id) {
            this.setState({dropTarget: group});
        }
    }

    handleDrop(group, e) {
        const {dragging, dropTarget} = this.state;
        if (dragging && dropTarget && dragging.id !== dropTarget.id) {
            if (dropTarget.order < dragging.order) {
                dragging.order = dropTarget.order - 0.5;
            } else if (dropTarget.order > dragging.order) {
                dragging.order = dropTarget.order + 0.5;
            }
            const categories = {};
            this.sortedGroups.sort((x, y) => (x.order - y.order));
            this.sortedGroups.forEach((x, idx) => {
                x.order = idx + 1;
                categories[x.id] = {key: x.key, order: x.order};
            });
            App.user.config.groupsCategories = categories;
        }
        e.stopPropagation();
    }

    handleDragStart(group, e) {
        this.setState({dragging: group});
        this.sortedGroups = this.groupChats;
        e.stopPropagation();
        return true;
    }

    handleDragEnd(group, e) {
        this.setState({dragging: false});
        e.stopPropagation();
        return true;
    }

    headingCreator = (group, groupList) => {
        const icon = groupList.isExpand ? groupList.props.expandIcon : groupList.props.collapseIcon;
        let iconView = null;
        if (icon) {
            if (React.isValidElement(icon)) {
                iconView = icon;
            } else if (typeof icon === 'object') {
                iconView = <Icon {...icon} />;
            } else {
                iconView = <Icon name={icon} />;
            }
        }
        const {dragging, dropTarget} = this.state;
        const isDragging = dropTarget && dragging && dropTarget.id === group.id && dragging.id !== group.id;
        const dragClasses = {
            'is-dragging': isDragging,
            'drop-top': isDragging && dropTarget.order < dragging.order,
            'drop-bottom': isDragging && dropTarget.order > dragging.order,
        };
        return (<header
            onContextMenu={this.handleHeadingContextMenu.bind(this, group)}
            onClick={groupList.props.toggleWithHeading ? groupList.handleHeadingClick : null}
            className={classes('heading', dragClasses)}
            draggable
            onDragOver={this.handleDragOver.bind(this, group)}
            onDrop={this.handleDrop.bind(this, group)}
            onDragStart={this.handleDragStart.bind(this, group)}
            onDragEnd={this.handleDragEnd.bind(this, group)}
        >
            {iconView}
            <div className="title strong">{group.title || Lang.string('chats.menu.group.other')} ({group.list.length})</div>
        </header>);
    };

    defaultExpand = (group) => {
        return group.list && !!group.list.find(item => {
            let isExpand = App.im.ui.isActiveChat(item.gid);
            if (!isExpand) {
                isExpand = App.profile.userConfig.getChatMenuGroupState('groups', this.groupType, group.id);
            }
            return isExpand;
        });
    };

    onExpandChange = (expanded, group) => {
        App.profile.userConfig.setChatMenuGroupState('groups', this.groupType, group.id, expanded);
    };

    render() {
        const {
            search,
            filter,
            className,
            children,
            ...other
        } = this.props;

        const chats = App.im.chats.getGroups(true, 'category');
        this.groupChats = chats;

        return (<div className={classes('app-chats-menu-list app-chat-group-list list scroll-y', className)} {...other}>
            {
                GroupList.render(chats, {
                    defaultExpand: this.defaultExpand,
                    itemCreator: this.itemCreator,
                    headingCreator: this.headingCreator,
                    hideEmptyGroup: true,
                    checkIsGroup: this.checkIsGroup,
                    onExpandChange: this.onExpandChange,
                    forceCollapse: !!this.state.dragging
                })
            }
            {children}
        </div>);
    }
}
