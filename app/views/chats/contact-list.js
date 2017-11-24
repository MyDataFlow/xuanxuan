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

const handleItemContextMenu = (chat, e) => {
    const menuItems = App.im.ui.createChatContextMenuItems(chat);
    ContextMenu.show({x: e.pageX, y: e.pageY}, menuItems);
    e.preventDefault();
};

const GROUP_TYPES = [
    {label: Lang.string('chats.contacts.groupType.normal'), data: 'normal'},
    {label: Lang.string('chats.contacts.groupType.role'), data: 'role'},
    {label: Lang.string('chats.contacts.groupType.dept'), data: 'dept'},
];

export default class ContactList extends Component {
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

    static get ContactList() {
        return replaceViews('chats/contact-list', ContactList);
    }

    constructor(props) {
        super(props);
        this.state = {
            groupType: ''
        };
    }

    componentDidMount() {
        this.dataChangeHandler = App.events.onDataChange(data => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        App.events.off(this.dataChangeHandler);
    }

    get groupType() {
        let {groupType} = this.state;
        if (!groupType) {
            const user = App.user;
            groupType = user ? user.config.contactsGroupByType : 'normal';
        }
        return groupType;
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
        const menus = GROUP_TYPES.map(type => {
            return {
                label: type.label,
                data: type.data,
                icon: type.data === groupType ? 'check text-success' : false
            };
        });
        menus.splice(0, 0, {label: Lang.string('chats.contacts.switchView'), disabled: true});
        App.ui.showContextMenu({x: e.clientX, y: e.clientY, target: e.target}, menus, {onItemClick: item => {
            if (item && item.data) {
                this.groupType = item.data;
            }
        }});
        e.stopPropagation();
    };

    itemCreator = chat => {
        return <ChatListItem onContextMenu={handleItemContextMenu.bind(this, chat)} key={chat.gid} filterType={this.props.filter} chat={chat} className="item" />;
    };

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
        return (<header onClick={groupList.props.toggleWithHeading ? groupList.handleHeadingClick : null} className="heading">
            {iconView}
            <div className="title"><strong>{group.title || Lang.string('chats.contacts.group.other')}</strong> ({group.onlineCount}/{group.list.length})</div>
        </header>);
    };

    defaultExpand = (group) => {
        return !!group.list.find(item => {
            if (item.type === 'group') {
                return this.defaultExpand(item);
            }
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

        const chats = App.im.chats.getContactsChats(true, this.groupType);
        const user = App.user;

        return (<div className={HTML.classes('app-chats-menu-list app-contact-list list scroll-y', className)} {...other}>
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
            {
                GroupList.render(chats, {
                    defaultExpand: this.defaultExpand,
                    itemCreator: this.itemCreator,
                    headingCreator: this.headingCreator,
                    hideEmptyGroup: true,
                })
            }
            {children}
        </div>);
    }
}
