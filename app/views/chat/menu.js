import React, {PropTypes}  from 'react';
import Theme               from 'Theme';
import {App, Lang, Config} from '../../app';
import ChatPlusIcon        from '../icons/comment-plus-outline';
import UserAvatar          from '../user-avatar';
import ChatsIcon           from '../icons/comments-outline';
import ComtentTextIcon     from '../icons/comment-text';
import PoundIcon           from '../icons/pound-box';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import PersonOutlineIcon   from 'material-ui/svg-icons/social/people-outline';
import VisibilityOffIcon   from 'material-ui/svg-icons/action/visibility-off';
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
import NewChatWindow       from './newchat';

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
        return {
            data: {},
            type: MENU_TYPES[App.user.config.ui.chat.menu.type] ? MENU_TYPES[App.user.config.ui.chat.menu.type] : MENU_TYPES.contacts,
            activeChat: false,
            search: ''
        };
    },

    _handleItemClick(chatGid, chat) {
        if(typeof chatGid === 'object') {
            let chatTemp = chatGid;
            chatGid = chatTemp.gid;
            chat = chatTemp;
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

    // _updateData(chats, type) {
    //     if(typeof chats === 'string') {
    //         type = chats;
    //         chats = null;
    //     }
    //     type = type || this.state.type;
    //     chats = chats || App.chat.all;
    //     if(!chats) return;

    //     let data;
    //     if(type === 'recent') {
    //         let favs = [], recent = [];
    //         chats.forEach(chat => {
    //             if(chat.star) favs.push(chat);
    //             else recent.push(chat);
    //         });

    //         Chat.sort(favs, App, -1, true);
    //         Chat.sort(recent, App, -1, true);

    //         data = [];
    //         if(favs.length) {
    //             data.push({name: 'fav', title: Lang.chat.favList, items: favs});
    //         }
    //         if(recent.length) {
    //             data.push({name: 'recent', title: Lang.chat.recentList, items: recent});
    //         }
    //     } else {
    //         const groupedOrder = {
    //             fav: 0,
    //             one2one: 1,
    //             channel: 2,
    //             group: 3
    //         };
    //         data = Helper.sortedArrayGroup(chats, chat => {
    //             if(chat.star) return 'fav';
    //             if(chat.public || chat.isSystem) return 'channel';
    //             if(chat.isOne2One) return 'one2one';
    //             return 'group';
    //         }, (group1, group2) => {
    //             return groupedOrder[group1.name] - groupedOrder[group2.name];
    //         });
    //         data.forEach(x => {
    //              Chat.sort(x.items, App);
    //         });
    //     }

    //     this.setState({data, type});
    //     if(!this.state.activedItem && data) {
    //         let first = null;
    //         for(let dataItems of data) {
    //             if(dataItems.items && dataItems.items.length) {
    //                 first = dataItems.items[0];
    //                 break;
    //             }
    //         }
    //         if(first) this._handleItemClick('chat', first.gid, first);
    //     }
    // },

    _getData(type, search) {
        if(!App.user || App.user.isOffline) return [];
        type = type || this.state.type || MENU_TYPES.contacts;
        search = search || this.state.search;
        if(!Helper.isEmptyString(search)) {
            console.info('search>', search);
            return [{name: 'search', items: App.chat.searchChats(search)}];
        }
        if(!this.dataCache) this.dataCache = {};
        if(this.dataCache[type]) return this.dataCache[type];
        var data = [];
        if(MENU_TYPES[type]) {
            switch(type) {
                case MENU_TYPES.recent:
                    var items = App.chat.getRecents(true);
                    items = Chat.sort(items, {compareNotice: true}, App);
                    data.push({name: MENU_TYPES.recent, items});
                    break;
                case MENU_TYPES.contacts:
                    var items = App.chat.getContactsChats();
                    items = Chat.sort(items, {
                        order: -1,
                        starFirst: true,
                        compareNotice: false,
                        compareLastActiveTime: false,
                        compareOnline: true,
                        compareCreateDate: false,
                        compareName: true
                    }, App);
                    data.push({name: MENU_TYPES.contacts, items});
                    break;
                case MENU_TYPES.groups:
                    var items = App.chat.getGroups();
                    items = Chat.sort(items, {compareNotice: true}, App);
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
    },

    componentWillUnmount() {
        if(this.saveUserTask) {
            clearTimeout(this.saveUserTask);
            App.saveUser();
        }
        App.off(this._handleUIChangeEvent, this._handleDataChangeEvent);
    },

    componentDidUpdate(prevProps, prevState) {
        if(App.user.config.ui.chat.menu.type != this.state.type) {
            App.user.config.ui.chat.menu.type = this.state.type;
            clearTimeout(this.saveUserTask);
            this.saveUserTask = setTimeout(() => {
                App.saveUser();
                this.saveUserTask = null;
            }, 2000);
        }
    },

    render() {
        const STYLE = {
            menu: {width: App.user.config.ui.chat.menu.width, backgroundColor: Theme.color.pale1, paddingBottom: 48},
            list: {
                backgroundColor: 'transparent', 
                paddingTop: 0, 
                paddingBottom: 0
            },
            listContainer: {
                top: 48
            },
            starItemStyle: {
                backgroundColor: 'yellow'
            },
            buttonItem: {color: Theme.color.primary1},
            rightIcon: {
                textAlign: 'right',
                paddingLeft: 0,
                lineHeight: '24px'
            },
            badgeRed: {
                backgroundColor: Theme.colors.red500,
                color: 'white',
                lineHeight: '16px',
                display: 'inline-block',
                fontSize: '12px',
                padding: '0 4px',
                borderRadius: 8,
                minWidth: 8,
                textAlign: 'center',
                width: 'auto'
            },
            subheader: {fontSize: '12px', lineHeight: '30px', marginTop: 10, width: 'auto'},
            listShowButton: {
                fontSize: '13px',
                display: 'block',
                padding: '10px 15px'
            },
            userStatus: {
                position: 'absolute',
                bottom: 0,
                right: 0
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
                {
                    data.items.map(item => {
                        let rightIcon = (item.noticeCount && (!App.isWindowOpen || !App.isWindowsFocus || item.gid !== App.chat.activeChatWindow)) ? (<div style={STYLE.rightIcon}><div style={STYLE.badgeRed}>{item.noticeCount > 99 ? '99+' : item.noticeCount}</div></div>) : null;
                        let itemKey = item.gid;
                        if(item.isOne2One) {
                            let theOtherOne = item.getTheOtherOne(App.user);
                            let primaryText = item.getDisplayName(App);
                            return <ListItem
                                key={itemKey}
                                style={item.star ? STYLE.starItemStyle : null}
                                actived={this.state.activeChat === itemKey}
                                onContextMenu={this._handleItemContextMenu.bind(this, item)} 
                                onClick={this._handleItemClick.bind(null, item.gid, item)} 
                                primaryText={primaryText} 
                                leftAvatar={<UserAvatar size={20} user={theOtherOne} style={STYLE.avatar} className={theOtherOne && theOtherOne.isOffline ? 'grayscale' : ''}/>}
                                rightIcon={rightIcon}
                            />;
                        } else {
                            return <ListItem
                                key={itemKey}
                                style={item.star ? STYLE.starItemStyle : null}
                                actived={this.state.activeChat === itemKey}
                                onContextMenu={this._handleItemContextMenu.bind(this, item)}
                                onClick={this._handleItemClick.bind(null, item.gid, item)}
                                primaryText={item.getDisplayName(App)}
                                rightIcon={rightIcon}
                                leftIcon={item.isSystem ? <ComtentTextIcon color={Colors.indigo500}/> : item.public ? <PoundIcon color={Colors.lightGreen700}/> : <PersonOutlineIcon color={Colors.lightBlue500}/>}
                            />;
                        }
                    })
                }
                </ListPanel>;
                listElements.push(list);
            });
        }

        style = Object.assign({}, STYLE.menu, style);
        return <div className='dock-left' style={style} {...other}>
          <div className='dock-top' style={STYLE.header}>
            <SearchBox onValueChange={this._handleSearchChange}/>
          </div>
          <div className='scroll-y dock-full' style={STYLE.listContainer}>
            {listElements}
          </div>
        </div>
    }
});

export default ChatMenu;
