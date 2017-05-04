import React            from 'react';
import ClickAwayable    from 'react-clickaway';
import List             from 'material-ui/List/List';
import ListDivider      from 'material-ui/Divider';
import Colors           from 'Utils/material-colors';
import Avatar           from 'material-ui/Avatar';
import FontIcon         from 'material-ui/FontIcon';
import Paper            from 'material-ui/Paper';
import Menu             from 'material-ui/Menu';
import MenuItem         from 'material-ui/MenuItem';
import MenuDivider      from 'material-ui/Divider';
import IconButton       from 'material-ui/IconButton';
import ChatIcon         from './icons/comment-outline';
import ActiveChatIcon   from './icons/comment';
import GroupIcon        from './icons/comments-outline';
import PoundIcon        from './icons/pound';
import PoundBoxIcon     from './icons/pound-box';
import PeopleIcon       from 'material-ui/svg-icons/social/people-outline';
import ActivePeopleIcon from 'material-ui/svg-icons/social/people';
import TimeIcon         from 'material-ui/svg-icons/device/access-time';
import AppsIcon         from 'material-ui/svg-icons/action/dashboard';
import MoreIcon         from 'material-ui/svg-icons/navigation/more-vert';
import MenuIcon         from 'material-ui/svg-icons/navigation/menu';
import CvLeftIcon       from 'material-ui/svg-icons/navigation/chevron-left';
import CheckIcon        from 'material-ui/svg-icons/navigation/check';
import SettingIcon      from 'material-ui/svg-icons/action/settings';
import UserAvatar       from './user-avatar';
import ListItem         from './components/small-list-item';
import UserStatus       from './chat/user-status';
import Theme            from '../theme';
import Lang             from '../lang';
import R                from '../resource';
import App              from '../app';
import {USER_STATUS}    from 'Models/user';

const userStatus = [
    USER_STATUS.online,
    USER_STATUS.busy,
    USER_STATUS.away,
    USER_STATUS.offline,
];

/**
 * User menu component
 */
const UserMenu = React.createClass({
    mixins: [ClickAwayable],

    getInitialState() {
        return {
            canUpdate: App.hasNewVersion
        }
    },

    componentClickAway() {
        if(this.props.onClickAway) this.props.onClickAway();
    },

    handleStatusItemClick(status) {
        status = USER_STATUS.getName(status);
        if(status === 'offline' || status === 'unverified') {
            App.logout();
        } else if(App.user.isOffline) {
            App.login();
        } else {
            App.changeUserStatus(status);
        }
        this.componentClickAway();
    },

    handleExitClick() {
        this.componentClickAway();
        App.quit();
    },

    handleProfileClick() {
        App.openProfile();
        this.componentClickAway();
    },

    handleAboutClick() {
        App.openAbout();
        this.componentClickAway();
    },

    handleDevToolClick() {
        App.openDevWindow();
        this.componentClickAway();
    },

    handleRestartBtnClick() {
        App.reloadApp();
        this.componentClickAway();
    },

    handleSettingBtnClick() {
        App.openSettingDialog();
        this.componentClickAway();
    },

    render() {
        const STYLE = {
            menu: {paddingTop: 8, paddingBottom: 8, display: 'block'},
            menuItem: {fontSize: '13px'},
            focusMenuItem: {
                fontSize   : '13px',
                color      : Theme.color.positive,
                boxShadow  : 'inset 3px 0 0 ' + Theme.color.positive,
                fontWeight : '500',
            },
            navbar:    {width: App.user.getConfig('ui.navbar.width', 50), transition: Theme.transition.normal('width'), backgroundColor: Theme.color.primary1, zIndex: 20},
            status:    {
                base:   {position: 'absolute', left: -29, top: 13, transition: Theme.transition.normal('left', 'top')},
                dot:    {display: 'block', width: 10, height: 10, borderRadius: 6, marginRight: 5},
                inmenu: {
                    dot:  {position: 'relative', top: 1, marginRight: 10},
                    text: {fontSize: '14px'}
                }
            }
        };

        let that = this;
        let thisStatus = this.props.user.statusValue;
        let style = this.props.style;
        return <Paper style={Object.assign({position: 'absolute', top: 0, zIndex: 2, width: 160, left: 50}, style)}>
          <Menu key='user-menu' desktop={true} autoWidth={false} animated={false} className='navbar-user-menu' listStyle={STYLE.menu}>
              {
                  userStatus.map(function(statusValue) {
                      if(statusValue === USER_STATUS.offline) {
                          return;
                      }
                      let statusName = USER_STATUS[statusValue];
                      let iconStyle = Object.assign({}, STYLE.status.base, STYLE.status[statusName], STYLE.status.inmenu);
                      let icon = <span className={'user-status user-status-' + statusName} style={iconStyle}></span>;
                      let rightIcon = null;
                      if(statusValue === thisStatus) {
                          rightIcon = <CheckIcon style={{margin: 0}} />
                      }
                      return <MenuItem key={statusName} primaryText={<UserStatus textStyle={STYLE.status.inmenu.text} text={statusValue === USER_STATUS.offline ? Lang.user.status.offline : Lang.user.status[statusName]} dotStyle={STYLE.status.inmenu.dot} type='dot-text' status={statusName} />} rightIcon={rightIcon} onClick={that.handleStatusItemClick.bind(null, statusName)}/>
                  })
              }
              <MenuDivider />
              <MenuItem style={STYLE.menuItem} key='profile' primaryText={Lang.user.profile} onClick={this.handleProfileClick} />
              <MenuDivider />
              <MenuItem style={STYLE.menuItem} key='about' primaryText={Lang.common.about} onClick={this.handleAboutClick} />
              <MenuItem style={STYLE.menuItem} key='settings' primaryText={Lang.common.settings} onClick={this.handleSettingBtnClick} />
              <MenuItem style={STYLE.menuItem} key='logout' primaryText={Lang.user.logout} onClick={this.handleStatusItemClick.bind(this, USER_STATUS.offline)} />
              <MenuItem style={STYLE.menuItem} key='exit' primaryText={Lang.common.exit} onClick={this.handleExitClick} />
          </Menu>
        </Paper>;
    }
});

/**
 * Navbar component
 */
const Navbar = React.createClass({
    getInitialState() {
        return {
            active: App.user.getConfig('ui.navbar.active', R.ui.navbar_chat),
            user: {name: 'Guest', status: 'online'},
            menu: false,
            notice: 0
        };
    },

    handleItemClick(name) {
        App.emit(R.event.ui_change, {
            navbar: name
        });
    },

    hideMenu() {
        if(this.state.menu) this.setState({menu: false});
    },

    handleUserAvatarClick() {
        this.setState({menu: !this.state.menu});
    },

    handleSettingBtnClick() {
        App.openSettingDialog();
    },

    componentDidMount() {
        this._handleUserChangeEvent = App.on(R.event.user_change, e => {
            this.setState({user: App.user});
        });
        this._handleUserLoginFinishEvent = App.on(R.event.user_status_change, e => {
            this.setState({user: App.user});
        });
        this._handleUIChangeEvent = App.on(R.event.ui_change, e => {
            if(e.navbar) {
                this.setState({active: e.navbar});
            }
        });
        this._handleChatNoticeEvent = App.on(R.event.chats_notice_change, notice => {
            this.setState({notice});
        });

        this.handleItemClick(this.state.active);
    },

    componentWillUnmount() {
        App.off(this._handleUIChangeEvent, this._handleUserLoginFinishEvent, this._handleUserChangeEvent, this._handleChatNoticeEvent);
    },

    render() {
        const that = this;
        const isAvatarOnTop = App.user.getConfig('ui.navbar.avatarPosition', 'bottom') === 'top';
        const STYLE = {
            navbar:     {width: 50, transition: Theme.transition.normal('width'), backgroundColor: Theme.color.primary1, zIndex: 20},
            icon:       {left: 5},
            rightIcon:  {right: 6, top: 14},
            navItem:    {paddingTop: 5, paddingBottom: 5, height: 50},
            list:       {paddingTop: isAvatarOnTop ? 8 : 0, paddingBottom: isAvatarOnTop ? 8 : 0},
            avatar:     {position: 'static'},
            iconButton: {position: 'absolute', left: 1, top: -4},
            status:     {
                base:   {position: 'absolute', bottom: 3, left: 32, transition: Theme.transition.normal('left', 'top'), zIndex: 10, },
                dot:    {display: 'block', width: 10, height: 10, borderRadius: 6, marginRight: 5},
            },
            noticeBadge: {
                position       : 'absolute',
                top            : 3,
                right          : 14,
                backgroundColor: Theme.colors.red500,
                color          : 'white',
                lineHeight     : '16px',
                display        : 'inline-block',
                fontSize       : '12px',
                padding        : '0 4px',
                borderRadius   : 8,
                minWidth       : 8,
                textAlign      : 'center',
                width          : 'auto',
                zIndex         : 10
            }
        };

        const onlyShowNoticeCountOnRecents = App.user.getConfig('ui.navbar.onlyShowNoticeCountOnRecents');
        let listItems = [];
        listItems.push({name: R.ui.navbar_chat, text: "最近聊天", icon: this.state.active === R.ui.navbar_chat ? <ActiveChatIcon className='icon' style={STYLE.icon}/> : <ChatIcon className='icon' style={STYLE.icon}/>});
        listItems.push({name: R.ui.navbar_groups, text: "讨论组", icon: this.state.active === R.ui.navbar_groups ? <PoundBoxIcon className='icon' style={STYLE.icon}/> : <PoundIcon className='icon' style={STYLE.icon}/>});
        listItems.push({name: R.ui.navbar_contacts, text: "联系人", icon: this.state.active === R.ui.navbar_contacts ? <ActivePeopleIcon className='icon' style={STYLE.icon}/> : <PeopleIcon className='icon' style={STYLE.icon}/>});

        let statusStyle = Object.assign({}, STYLE.status.base);
        let userDisplayName = this.state.user.displayName || this.state.user.realName || this.state.user.account;
        let userAvatar = <UserAvatar user={this.state.user} style={STYLE.avatar} size={36}/>;
        let navbarStyle = Object.assign({}, STYLE.navbar);
        let menu = this.state.menu ? <UserMenu user={this.state.user} onClickAway={this.hideMenu} style={!isAvatarOnTop ? {top: 'auto', bottom: 0} : null}/> : null;
        let userAvatarItem = <ListItem 
            className='item hint--right'
            key='user-info'
            data-hint={userDisplayName + ' [' + Lang.user.status[USER_STATUS.getName(this.state.user.status)] + ']'}
            leftAvatar={userAvatar}
            onClick={that.handleUserAvatarClick}
            style={STYLE.navItem}
            innerDivStyle={{padding: 2, height: 36, textAlign: 'center'}}
        ><UserStatus style={statusStyle} dotStyle={STYLE.status.dot} status={this.state.user.status} /></ListItem>;

        return (
          <div {...this.props} className="navbar dock-left" style={navbarStyle}>
            {isAvatarOnTop ? <List className='list navbar-header' style={STYLE.list}>{userAvatarItem}</List> : null}
            {menu}
            <List className='list navbar-nav' style={STYLE.list}>
            {
                listItems.map(item => {
                    let noticeCountText = null;
                    if(this.state.notice && this.state.notice.total) {
                        let noticeCount = 0;
                        switch(item.name) {
                            case R.ui.navbar_chat:
                                noticeCount = this.state.notice.total || 0;
                                break;
                            case R.ui.navbar_groups:
                                if(!onlyShowNoticeCountOnRecents) {
                                    noticeCount = this.state.notice.group || 0;
                                }
                                break;
                            case R.ui.navbar_contacts:
                                if(!onlyShowNoticeCountOnRecents) {
                                    noticeCount = this.state.notice.contact || 0;
                                }
                                break;
                        }
                        if(noticeCount) {
                            if(noticeCount > 999) {
                                noticeCount = '+999';
                            }
                            noticeCountText = <div style={STYLE.noticeBadge}>{noticeCount}</div>;
                        }
                    }
                    return  <ListItem
                        actived={item.name === that.state.active}
                        activeColor="rgba(255,255,255,.15)"
                        leftIcon={item.icon}
                        data-hint={item.text}
                        className={'item hint--right' + (item.name === that.state.active ? ' active' : '')}
                        key={item.name}
                        primaryText='&nbsp;'
                        onClick={that.handleItemClick.bind(null, item.name)}
                        style={STYLE.navItem}
                    >
                        {noticeCountText}
                    </ListItem>;
                })
            }
            </List>
            <List className='list navbar-footer dock-bottom' style={STYLE.list}>
              {isAvatarOnTop ? <ListItem data-hint={Lang.common.settings} className="item hint--right" key='setting' leftIcon={<SettingIcon className='icon' style={STYLE.icon}/>} primaryText='&nbsp;' onClick={that.handleSettingBtnClick} style={STYLE.navItem}/> : null} 
              {!isAvatarOnTop ? userAvatarItem : null}
            </List>
          </div>
        );
    }
});

export default Navbar;
