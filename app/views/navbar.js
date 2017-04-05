import React           from 'react';
import ClickAwayable   from 'react-clickaway';
import List            from 'material-ui/List/List';
import ListDivider     from 'material-ui/Divider';
import Colors          from 'Utils/material-colors';
import Avatar          from 'material-ui/Avatar';
import FontIcon        from 'material-ui/FontIcon';
import Paper           from 'material-ui/Paper';
import Menu            from 'material-ui/Menu';
import MenuItem        from 'material-ui/MenuItem';
import MenuDivider     from 'material-ui/Divider';
import IconButton      from 'material-ui/IconButton';
import ChatIcon        from './icons/comment-outline';
import GroupIcon       from './icons/comments-outline';
import PoundIcon       from './icons/pound';
import PeopleIcon      from 'material-ui/svg-icons/social/people-outline';
import TimeIcon        from 'material-ui/svg-icons/device/access-time';
import AppsIcon        from 'material-ui/svg-icons/action/dashboard';
import MoreIcon        from 'material-ui/svg-icons/navigation/more-vert';
import MenuIcon        from 'material-ui/svg-icons/navigation/menu';
import CvLeftIcon      from 'material-ui/svg-icons/navigation/chevron-left';
import CheckIcon       from 'material-ui/svg-icons/navigation/check';
import SettingIcon     from 'material-ui/svg-icons/action/settings';
import UserAvatar      from './user-avatar';
import ListItem        from './components/small-list-item';
import UserStatus      from './chat/user-status';
import Theme           from '../theme';
import Lang            from '../lang';
import R               from '../resource';
import App             from '../app';
import {USER_STATUS}   from 'Models/user';

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
        if(status === 'offline' || status === 'unverified') {
            App.user.changeStatus(USER_STATUS.unverified);
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

    render() {
        const STYLE = {
            menu: {paddingTop: 8, paddingBottom: 8},
            menuItem: {fontSize: '13px'},
            focusMenuItem: {
                fontSize: '13px',
                color: Theme.color.positive,
                boxShadow: 'inset 3px 0 0 ' + Theme.color.positive,
                fontWeight: '500',
            },
            navbar:    {width: App.user.config.ui.navbar.width, transition: Theme.transition.normal('width'), backgroundColor: Theme.color.primary1, zIndex: 20},
            status:    {
                base:   {position: 'absolute', left: -29, top: 13, transition: Theme.transition.normal('left', 'top')},
                dot: {display: 'block', width: 10, height: 10, borderRadius: 6, marginRight: 5},
                inmenu: {
                  dot: {position: 'relative', top: 1, marginRight: 10},
                  text: {fontSize: '14px'}
                }
            }
        };

        let that = this;
        let thisStatus = this.props.user.statusValue;
        return <div className='menu-wrapper' style={{position: 'relative', left: 0, minWidth: 200}}>
          <Paper style={{position: 'absolute', top: -15, zIndex: 2}}>
            <Menu key='user-menu' desktop={true} autoWidth={false} width={STYLE.navbar.width} animated={false} className='navbar-user-menu' listStyle={STYLE.menu}>
                {
                    userStatus.map(function(statusValue) {
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
                <MenuItem style={STYLE.menuItem} key='exit' primaryText={Lang.common.exit} onClick={this.handleExitClick} />
            </Menu>
          </Paper>
        </div>
    }
});

/**
 * Navbar component
 */
const Navbar = React.createClass({
    getInitialState() {
        return {
            active: App.user.config.ui.navbar.page,
            user: {name: 'Guest', status: 'online'},
            menu: false,
            chatNoticeCount: 0
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
        this._handleChatNoticeEvent = App.on(R.event.chats_notice_change, chatNoticeCount => {
            this.setState({chatNoticeCount});
        });

        this.handleItemClick(this.state.active);
    },

    componentWillUnmount() {
        App.off(this._handleUIChangeEvent, this._handleUserLoginFinishEvent, this._handleUserChangeEvent, this._handleChatNoticeEvent);
    },

    render() {
        const STYLE = {
            compactWidth: App.user.config.ui.navbar.compactWidth,
            navbar:     {width: 50, transition: Theme.transition.normal('width'), backgroundColor: Theme.color.primary1, zIndex: 20},
            icon:       {left: 5},
            rightIcon:  {right: 6, top: 14},
            list:       {backgroundColor: 'transparent'},
            navItem:    {paddingTop: 6, paddingBottom: 6, maxHeight: 60},
            avatar:     {left: 7},
            footer:     {backgroundColor: 'transparent', position: 'absolute', left: 0, right: 0, bottom: 0, padding: 0},
            footerItem: {maxHeight: 48},
            iconButton: {position: 'absolute', left: 1, top: -4},
            tooltip:    {pointerEvents: 'none', fontSize: '12px', zIndex: 100},
            status:     {
                base:   {position: 'absolute', left: -29, top: 13, transition: Theme.transition.normal('left', 'top')},
                dot: {display: 'block', width: 10, height: 10, borderRadius: 6, marginRight: 5},
            },
            noticeBadge: {position: 'absolute', top: 8, left: 5, width: 40, height: 20, color: Theme.color.primary1, textAlign: 'center', lineHeight: '20px', zIndex: 1, fontSize: '12px'}
        };

        let listItems = [
            {name: R.ui.navbar_chat,   text: "最近聊天", icon: <ChatIcon className='icon' style={STYLE.icon}/>},
            {name: R.ui.navbar_contacts,   text: "联系人", icon: <PeopleIcon className='icon' style={STYLE.icon}/>},
            {name: R.ui.navbar_groups,   text: "讨论组", icon: <PoundIcon className='icon' style={STYLE.icon}/>}
        ];

        let that = this;
        let statusStyle = Object.assign({}, STYLE.status.base);
        let userDisplayName = this.state.user.displayName || this.state.user.realName || this.state.user.account;
        let userAvatar = <UserAvatar user={this.state.user} style={STYLE.avatar} size={36}/>;
        let userInfo =  <div style={{position: 'relative'}}><UserStatus style={statusStyle} dotStyle={STYLE.status.dot} status={this.state.user.status} />&nbsp;</div>;
        let navbarStyle = Object.assign({}, STYLE.navbar);
        let menu = this.state.menu ? <UserMenu user={this.state.user} onClickAway={this.hideMenu}/> : null;

        return (
          <div {...this.props} className="navbar dock-left" style={navbarStyle}>
            <List className='list navbar-header' style={STYLE.list}>
              <ListItem className='item hint--right' key='user-info' data-hint={userDisplayName + ' [' + Lang.user.status[USER_STATUS.getName(this.state.user.status)] + ']'} primaryText={userInfo} leftAvatar={userAvatar} onClick={that.handleUserAvatarClick} style={{fontSize: '14px'}}/>
            </List>
            {menu}
            <ListDivider style={STYLE.list} />
            <List className='list navbar-nav' style={STYLE.list}>
            {
                listItems.map(item => {
                    let className = 'item hint--right';
                    if(item.name === that.state.active) className += ' active';
                    let noticeCountText = null;
                    if(item.name === R.ui.navbar_chat && this.state.chatNoticeCount) {
                        noticeCountText = <div style={STYLE.noticeBadge}>{this.state.chatNoticeCount > 99 ? '99' : this.state.chatNoticeCount}</div>;
                    }
                    return  <ListItem leftIcon={item.icon} data-hint={item.text} className={className} key={item.name} primaryText='&nbsp;' onClick={that.handleItemClick.bind(null, item.name)} style={STYLE.navItem}>{noticeCountText}</ListItem>;
                })
            }
            </List>
            <List className='list navbar-footer' style={STYLE.footer}>
              <ListItem data-hint="设置" className="item hint--right" key='setting' leftIcon={<SettingIcon className='icon' style={STYLE.icon}/>} primaryText='&nbsp;' onClick={that.handleSettingBtnClick} style={STYLE.footerItem}/>
            </List>
          </div>
        );
    }
});

export default Navbar;
