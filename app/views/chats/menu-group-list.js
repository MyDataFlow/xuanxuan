import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import ContextMenu from '../../components/context-menu';
import Icon from '../../components/icon';
import GroupList from '../../components/group-list';
import Button from '../../components/button';
import {ChatListItem} from './chat-list-item';
import {MemberListItem} from '../common/member-list-item';
import UserProfileDialog from '../common/user-profile-dialog';
import replaceViews from '../replace-views';

export default class MenuGroupList extends Component {
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

    static get MenuGroupList() {
        return replaceViews('chats/menu-group-list', MenuGroupList);
    }

    handleItemContextMenu(chat, e) {
        const menuItems = App.im.ui.createChatContextMenuItems(chat, 'groups', 'category');
        ContextMenu.show({x: e.pageX, y: e.pageY}, menuItems);
        e.preventDefault();
    }

    checkIsGroup = item => {
        return item.list && item.entityType !== 'Chat';
    };

    itemCreator = chat => {
        return <ChatListItem onContextMenu={this.handleItemContextMenu.bind(this, chat)} key={chat.gid} filterType={this.props.filter} chat={chat} className="item" />;
    };

    handleHeadingContextMenu(group, e) {
        const menu = App.im.ui.createGroupHeadingContextMenu(group, 'group');
        App.ui.showContextMenu({x: e.clientX, y: e.clientY, target: e.target}, menu);
        e.preventDefault();
    }

    headingCreator = (group, groupList) => {
        const icon = groupList.state.expand ? groupList.props.expandIcon : groupList.props.collapseIcon;
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
        return (<header onContextMenu={this.handleHeadingContextMenu.bind(this, group)} onClick={groupList.props.toggleWithHeading ? groupList.handleHeadingClick : null} className="heading">
            {iconView}
            <div className="title strong">{group.title || Lang.string('chats.menu.group.other')} ({group.list.length})</div>
        </header>);
    };

    defaultExpand = (group) => {
        return group.list && !!group.list.find(item => {
            return App.im.ui.isActiveChat(item.gid);
        });
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

        return (<div className={HTML.classes('app-chats-menu-list app-chat-group-list list scroll-y', className)} {...other}>
            {
                GroupList.render(chats, {
                    defaultExpand: this.defaultExpand,
                    itemCreator: this.itemCreator,
                    headingCreator: this.headingCreator,
                    hideEmptyGroup: true,
                    checkIsGroup: this.checkIsGroup
                })
            }
            {children}
        </div>);
    }
}
