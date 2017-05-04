import React, {PropTypes}  from 'react';
import Theme               from 'Theme';
import {App, Lang, Config} from '../../app';
import ChatPlusIcon        from '../icons/comment-plus-outline';
import UserAvatar          from '../user-avatar';
import ChatsIcon           from '../icons/comments-outline';
import ComtentTextIcon     from '../icons/comment-text';
import PoundIcon           from '../icons/pound-box';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import VisibilityOffIcon   from 'material-ui/svg-icons/action/visibility-off';
import StarIcon            from 'material-ui/svg-icons/toggle/star';
import List                from 'material-ui/List/List';
import ListDivider         from 'material-ui/Divider';
import Subheader           from 'material-ui/Subheader';
import ListItem            from '../components/small-list-item';
import UserStatus          from './user-status';
import R                   from '../../resource';
import Helper              from 'Helper';
import Colors              from 'Utils/material-colors';
import Chat                from 'Models/chat/chat';
import ListPanel           from 'Components/list-panel';
import Modal               from 'Components/modal';
import SearchBox           from 'Components/classic-searchbox';
import TimeIcon            from 'material-ui/svg-icons/device/access-time';
import ListIcon            from 'material-ui/svg-icons/action/view-list';
import IconButton          from 'material-ui/IconButton';

let MENU_TYPES = {
    recent: 'recent',
    contacts: 'contacts',
    groups: 'groups'
};
MENU_TYPES[R.ui.navbar_chat]     = MENU_TYPES.recent;
MENU_TYPES[R.ui.navbar_contacts] = MENU_TYPES.contacts;
MENU_TYPES[R.ui.navbar_groups]   = MENU_TYPES.groups;

/**
 * Chat menu
 */
const ChatMenu = React.createClass({

    propTypes: {
        onChatItemClick: PropTypes.func
    },

    getInitialState() {
        let configType = App.user.getConfig('ui.navbar.active', R.ui.navbar_chat);
        return {
            data       : {},
            type       : MENU_TYPES[configType] || MENU_TYPES.contacts,
            activeChat : App.user.getConfig('ui.chat.activeChat'),
            search     : ''
        };
    },

    _handleItemClick(chatGid, chat) {
        if(typeof chatGid === 'object') {
            let chatTemp = chatGid;
            chatGid      = chatTemp.gid;
            chat         = chatTemp;
        }

        if(chat && chat.noticeCount) {
            chat.noticeCount = 0;
            App.emit(R.event.chats_notice, {muteChats: [chat]});
        }

        if(chatGid) {
            if(this.state.activeChat !== chatGid) {
                this.setState({activeChat: chatGid});
            }
            this.props.onChatItemClick && this.props.onChatItemClick(chatGid, chat);
        }
    },

    _handleItemContextMenu(chat, e) {
        e.preventDefault();
        App.popupContextMenu(App.chat.createActionsContextMenu(chat), e);
    },

    _handleSearchChange(search, isEmpty) {
        this.setState({search});
    },

    _handleSearchFocusChange(focus) {
        this.setState({searchFocus: focus});
    },

    _getData(type, search) {
        if(!App.user || App.user.isOffline) return [];
        type = type || this.state.type || MENU_TYPES.recent;
        search = search || this.state.search;
        if(!Helper.isEmptyString(search)) {
            return [{name: 'search', items: App.chat.searchChats(search, type === MENU_TYPES.contacts ? 'contact' : (type === MENU_TYPES.groups ? 'group' : false))}];
        }
        if(!this.dataCache) this.dataCache = {};
        if(this.dataCache[type]) return this.dataCache[type];
        var data = [];
        if(MENU_TYPES[type]) {
            switch(type) {
                case MENU_TYPES.recent:
                    var items = App.chat.getRecents(true);
                    items = Chat.sort(items, 'default', App);
                    data.push({name: MENU_TYPES.recent, items});
                    break;
                case MENU_TYPES.contacts:
                    var items = App.chat.getContactsChats();
                    items = Chat.sort(items, ['star', 'online', '-namePinyin', 'id'], App);
                    data.push({name: MENU_TYPES.contacts, items});
                    break;
                case MENU_TYPES.groups:
                    var items = App.chat.getGroups();
                    items = Chat.sort(items, ['star', 'isSystem', '-namePinyin'], App);
                    data.push({name: MENU_TYPES.groups, items});
                    break;
            }
            this.dataCache[type] = data;
        }
        return data;
    },

    componentDidMount() {
        this._handleUIChangeEvent = App.on(R.event.ui_change, ui => {
            if(ui.navbar && MENU_TYPES[ui.navbar]) {
                let newState = {type: MENU_TYPES[ui.navbar]};
                if(ui.search) {
                    newState.search = ui.search;
                }
                if(ui.activeChat) {
                    let chat = null, chatId = 0;
                    if(typeof ui.activeChat === 'object') {
                        chat = ui.activeChat;
                        chatId = chat.id;
                    } else {
                        chatId = ui.activeChat;
                    }
                    newState.activeChat = chatId;
                    this._handleItemClick(chatId, chat);
                }
                this.setState(newState);
            }
        });
        this._handleDataChangeEvent = App.on(R.event.data_change, data => {
            if(data.chats || data.members) {
                this.dataCache = null;
                this.forceUpdate();
            }
        });

        if(!this.state.activeChat) {
            this.checkActiveItemTask = setTimeout(() => {
                if(this.state.activeChat) return;
                const data = this._getData();
                if(data.length && data[0].items && data[0].items.length) {
                    this._handleItemClick(data[0].items[0]);
                }
            }, 600);
        }
    },

    componentWillUnmount() {
        clearTimeout(this.checkActiveItemTask);
        App.off(this._handleUIChangeEvent, this._handleDataChangeEvent);
    },

    render() {
        const STYLE = {
            menu: {
                width           : App.user.getConfig('ui.chat.menu.width', 200),
                backgroundColor : Theme.color.pale1, paddingBottom: 48
            },
            list: {
                backgroundColor : 'transparent', 
                paddingTop      : 0, 
                paddingBottom   : 0
            },
            listContainer: {
                top: 48
            },
            itemStyle: {
                outline: '1px solid transparent'
            },
            activeItemStyle: {
                backgroundColor : '#fff',
                outline         : '1px solid rgba(0,0,0,.075)',
                outlineOffset   : 0
            },
            starIconStyle: {
                color    : Theme.color.icon,
                fill     : Theme.color.icon,
                position : 'absolute',
                right    : 8,
                top      : 14,
                width    : 12,
                height   : 12,
                opacity  : .6
            },
            buttonItem: {color: Theme.color.primary1},
            rightIcon: {
                textAlign   : 'right',
                paddingLeft : 0,
                lineHeight  : '24px'
            },
            badgeRed: {
                backgroundColor : Theme.colors.red500,
                color           : 'white',
                lineHeight      : '16px',
                display         : 'inline-block',
                fontSize        : '12px',
                padding         : '0 4px',
                borderRadius    : 8,
                minWidth        : 8,
                textAlign       : 'center',
                width           : 'auto'
            },
            subheader: {fontSize: '12px', lineHeight: '30px', marginTop: 10, width: 'auto'},
            listShowButton: {
                fontSize : '13px',
                display  : 'block',
                padding  : '10px 15px'
            },
            userStatus: {
                position : 'absolute',
                bottom   : 0,
                right    : 0
            },
            header: {
                height: 50
            }
        };
        
        let {
            style,
            ...other
        } = this.props;

        let listElements = [];
        let listData = this._getData();
        if(Array.isArray(listData) && listData.length) {
            listData.forEach(data => {
                if(!data.items || !data.items.length) return;
                let key = data.name;
                let list = <ListPanel
                    className={'small menu-list-' + key}
                    headingStyle={{color: Theme.color.icon, fontSize: '12px'}}
                    headingIconStyle={{color: Theme.color.icon, fill: Theme.color.icon}}
                    key={'menu-list-' + key} 
                    style={STYLE.list}
                    heading={(data.title || false)}
                    expand={true}
                >
                {!this.state.search && this.state.type === MENU_TYPES.contacts && App.user.getConfig('ui.chat.menu.showMe') ? <ListItem
                    key={App.user.id}
                    style={STYLE.itemStyle}
                    onClick={() => App.openProfile()} 
                    primaryText={App.user.displayName} 
                    leftAvatar={<UserAvatar size={20} user={App.user} style={STYLE.avatar}/>}
                /> : null}
                {
                    data.items.map(item => {
                        let rightIcon = (item.noticeCount && (!App.isWindowOpen || !App.isWindowsFocus || item.gid !== App.chat.activeChatWindow)) ? (<div style={STYLE.rightIcon}><div style={STYLE.badgeRed}>{item.noticeCount > 99 ? '99+' : item.noticeCount}</div></div>) : null;
                        let itemKey = item.gid;
                        let isItemActived = itemKey === this.state.activeChat;
                        let itemStyle = Object.assign({}, STYLE.itemStyle);
                        if(isItemActived) Object.assign(itemStyle, STYLE.activeItemStyle);
                        let starItem = (item.star && !rightIcon) ? <StarIcon style={STYLE.starIconStyle}/> : null;
                        if(item.isOne2One) {
                            let theOtherOne = item.getTheOtherOne(App.user);
                            let primaryText = item.getDisplayName(App);
                            if(theOtherOne.isOffline) {
                                primaryText = <div className="muted">{primaryText} <small>{' [离线]'}</small></div>;
                            }
                            return <ListItem
                                key={itemKey}
                                style={itemStyle}
                                actived={isItemActived}
                                onContextMenu={this._handleItemContextMenu.bind(this, item)} 
                                onClick={this._handleItemClick.bind(null, item.gid, item)} 
                                primaryText={primaryText} 
                                leftAvatar={<UserAvatar size={20} user={theOtherOne} style={STYLE.avatar} className={theOtherOne && theOtherOne.isOffline ? 'grayscale muted' : ''}/>}
                                innerDivStyle={{paddingRight: rightIcon ? 30 : 10}}
                                rightIcon={rightIcon}
                            >{starItem}</ListItem>;
                        } else {
                            let primaryText = <div>{item.getDisplayName(App, false)} <small style={{opacity: 0.6}}>（{item.isSystem ? '所有人' : item.membersCount + '人'}）</small></div>;
                            return <ListItem
                                key={itemKey}
                                style={itemStyle}
                                actived={isItemActived}
                                onContextMenu={this._handleItemContextMenu.bind(this, item)}
                                onClick={this._handleItemClick.bind(null, item.gid, item)}
                                primaryText={primaryText}
                                rightIcon={rightIcon}
                                leftIcon={item.isSystem ? <ComtentTextIcon color={Colors.indigo500}/> : item.public ? <PoundIcon color={Colors.lightGreen700}/> : <ChatsIcon color={Colors.lightBlue500}/>}
                                innerDivStyle={{paddingRight: rightIcon ? 30 : 10}}
                            >{starItem}</ListItem>;
                        }
                    })
                }
                </ListPanel>;
                listElements.push(list);
            });
        }

        style = Object.assign({}, STYLE.menu, style);
        let focusSearch = this.state.searchFocus || !Helper.isEmptyString(this.state.search);
        return <div className='dock-left' style={style} {...other}>
          <div className='dock-top' style={STYLE.header}>
            <SearchBox
                className="dock-left"
                style={{right: focusSearch ? 0 : 40, position: 'absolute', transition: Theme.transition.normal('right')}}
                onValueChange={this._handleSearchChange}
                onFocusChange={this._handleSearchFocusChange}
                hintText={this.state.type === MENU_TYPES.contacts ? Lang.chat.searchContacts : (this.state.type === MENU_TYPES.groups ? Lang.chat.searchGroups : Lang.common.search)}
            />
            <IconButton onClick={e => {App.chat.openCreateNewChat();}} className="dock-right hint--left" data-hint={Lang.chat.newChat} style={{position: 'absolute', transform: focusSearch ? 'scale(0)' : 'scale(1)', opacity: focusSearch ? 0 : 1, transition: Theme.transition.normal('transform', 'opacity')}}><ChatPlusIcon style={{width: 20, height: 20}} color={Theme.color.icon} hoverColor={Theme.color.primary1}/></IconButton>
          </div>
          <div className='scroll-y dock-full' style={STYLE.listContainer}>
            {listElements}
          </div>
        </div>
    }
});

export default ChatMenu;
