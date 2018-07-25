import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import {showContextMenu} from '../../core/context-menu';
import Icon from '../../components/icon';
import GroupList from '../../components/group-list';
import Button from '../../components/button';
import {ChatListItem} from './chat-list-item';
import {MemberListItem} from '../common/member-list-item';
import UserProfileDialog from '../common/user-profile-dialog';
import replaceViews from '../replace-views';

const GROUP_TYPES = [
    {label: Lang.string('chats.menu.groupType.normal'), data: 'normal'},
    {label: Lang.string('chats.menu.groupType.category'), data: 'category'},
    {label: Lang.string('chats.menu.groupType.role'), data: 'role'},
    {label: Lang.string('chats.menu.groupType.dept'), data: 'dept'},
];

export default class MenuContactList extends Component {
    static get MenuContactList() {
        return replaceViews('chats/menu-contact-list', MenuContactList);
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
        const user = App.user;
        this.state = {
            groupType: user ? user.config.contactsGroupByType : 'normal',
            dragging: false,
            dropTarget: null
        };
    }

    get groupType() {
        return this.state.groupType;
    }

    set groupType(groupType) {
        this.setState({groupType}, () => {
            const user = App.user;
            if (user) {
                user.config.contactsGroupByType = groupType;
            }
        });
    }

    handleUserItemClick = () => {
        UserProfileDialog.show();
    };

    handleSettingBtnClick = e => {
        const groupType = this.groupType;
        const menus = GROUP_TYPES.map(type => ({
            hidden: type.data === 'dept' && !App.members.hasDepts,
            label: type.label,
            data: type.data,
            icon: type.data === groupType ? 'check text-success' : false
        }));
        menus.splice(0, 0, {label: Lang.string('chats.menu.switchView'), disabled: true});
        App.ui.showContextMenu({x: e.clientX, y: e.clientY, target: e.target}, menus, {onItemClick: item => {
            if (item && item.data) {
                this.groupType = item.data;
            }
        }});
        e.stopPropagation();
    };

    handleItemContextMenu = (event) => {
        const chat = App.im.chats.get(event.currentTarget.attributes['data-gid'].value);
        showContextMenu('chat.menu', {
            event,
            chat,
            menuType: 'contacts',
            viewType: this.state.groupType
        });
    }

    itemCreator = chat => {
        return <ChatListItem onContextMenu={this.handleItemContextMenu} data-gid={chat.gid} key={chat.gid} filterType={this.props.filter} chat={chat} className="item" />;
    };

    handleHeadingContextMenu(group, event) {
        showContextMenu('chat.group', {group, event});
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
            App.user.config.contactsCategories = categories;
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
        let countView = null;
        if (!group.list.length) {
            countView = '(0)';
        } else if (!group.onlySubGroup) {
            countView = `(${group.onlineCount || 0}/${group.list.length - (group.dept && group.dept.children ? group.dept.children.length : 0)})`;
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
            draggable={this.groupType === 'category'}
            onDragOver={this.handleDragOver.bind(this, group)}
            onDrop={this.handleDrop.bind(this, group)}
            onDragStart={this.handleDragStart.bind(this, group)}
            onDragEnd={this.handleDragEnd.bind(this, group)}
            onClick={groupList.props.toggleWithHeading ? groupList.handleHeadingClick : null}
            className={classes('heading', dragClasses)}
        >
            {iconView}
            <div className="title"><strong>{group.title || Lang.string('chats.menu.group.other')}</strong> {countView}</div>
        </header>);
    };

    defaultExpand = (group) => {
        return !!group.list.find(item => {
            if (item.type === 'group') {
                return this.defaultExpand(item);
            }
            let isExpand = App.im.ui.isActiveChat(item.gid);
            if (!isExpand) {
                isExpand = App.profile.userConfig.getChatMenuGroupState('contacts', this.groupType, group.id);
            }
            return isExpand;
        });
    };

    onExpandChange = (expanded, group) => {
        App.profile.userConfig.setChatMenuGroupState('contacts', this.groupType, group.id, expanded);
    };

    render() {
        const {
            search,
            filter,
            className,
            children,
            ...other
        } = this.props;

        const groupType = this.groupType;
        const chats = App.im.chats.getContactsChats('onlineFirst', groupType);
        const user = App.user;
        this.groupChats = chats;

        return (<div className={classes('app-chats-menu-list app-contact-list app-chat-group-list list scroll-y', className)} {...other}>
            {user ? <MemberListItem
                className="flex-middle app-member-me"
                member={user}
                avatarSize={24}
                showStatusDot={false}
                onClick={this.handleUserItemClick}
                title={<div className="title">{user.displayName} &nbsp;{user.role ? <div className="label rounded primary-pale text-gray small member-role-label">{user.getRoleName(App)}</div> : null}</div>}
            >
                <div className="btn-wrapper hint--left" data-hint={Lang.string('common.setting')}><Button onClick={this.handleSettingBtnClick} className="iconbutton rounded" icon="format-list-bulleted" /></div>
            </MemberListItem> : null}
            <GroupList
                group={{list: chats, root: true}}
                defaultExpand={this.defaultExpand}
                itemCreator={this.itemCreator}
                headingCreator={this.headingCreator}
                onExpandChange={this.onExpandChange}
                hideEmptyGroup={groupType !== 'category'}
                forceCollapse={!!this.state.dragging}
            />
            {children}
        </div>);
    }
}
