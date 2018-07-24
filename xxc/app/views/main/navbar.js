import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Route, Link} from 'react-router-dom';
import Config from 'Config';
import ExtsRuntime from 'ExtsRuntime';
import {rem, classes} from '../../utils/html-helper';
import Lang from '../../lang';
import Avatar from '../../components/avatar';
import App from '../../core';
import ROUTES from '../common/routes';
import UserSettingDialog from '../common/user-setting-dialog';
import {UserAvatar} from '../common/user-avatar';
import {StatusDot} from '../common/status-dot';
import {UserMenu} from './user-menu';
import replaceViews from '../replace-views';

const navbarItems = [
    {to: ROUTES.chats.recents.__, label: Lang.string('navbar.chats.label'), icon: 'comment-outline', activeIcon: 'comment-processing'},
    {to: ROUTES.chats.groups.__, label: Lang.string('navbar.groups.label'), icon: 'pound', activeIcon: 'pound-box'},
    {to: ROUTES.chats.contacts.__, label: Lang.string('navbar.contacts.label'), icon: 'account-multiple-outline', activeIcon: 'account-multiple'},
];
if (ExtsRuntime) {
    navbarItems.push({to: ROUTES.exts._, label: Lang.string('navbar.exts.label'), icon: 'apps', activeIcon: 'apps'});
}

/* eslint-disable */
const NavLink = ({item}) => (
    <Route
        path={item.to}
        children={({match}) => (
            <Link className={'block' + (match ? ' active' : '')} to={item.to}>
                <Avatar size={Config.ui['navbar.width']} icon={match ? item.activeIcon : item.icon} />
            </Link>
        )}
    />
);
/* eslint-enable */

class Navbar extends Component {
    static get Navbar() {
        return replaceViews('main/navbar', Navbar);
    }

    static propTypes = {
        className: PropTypes.string,
        userStatus: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        userStatus: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            showUserMenu: false,
            noticeBadge: 0,
        };
    }

    componentDidMount() {
        this.noticeUpdateHandler = App.notice.onNoticeUpdate(notice => {
            this.setState({noticeBadge: notice.total});
        });

        this.dataChangeEventHandler = App.events.onDataChange(data => {
            if (data && data.members && data.members[App.profile.userId]) {
                this.forceUpdate();
            }
        });

        const hashFilters = window.location.hash.split('/');
        if (hashFilters[0] === '#') {
            this.lastFilterType = hashFilters[1];
        }
    }

    componentWillUnmount() {
        App.events.off(this.noticeUpdateHandler, this.dataChangeEventHandler);
    }

    handleProfileAvatarClick = () => {
        this.setState({showUserMenu: true});
    };

    handleUserMenuRequestClose = () => {
        this.setState({showUserMenu: false});
    };

    handleSettingBtnClick = () => {
        UserSettingDialog.show();
    };

    handleMainNavItemClick = () => {
        setTimeout(() => {
            const hashFilters = window.location.hash.split('/');
            if (hashFilters[0] !== '#') {
                return;
            }
            const currentFilterType = hashFilters[1];
            if (this.lastFilterType && this.lastFilterType === currentFilterType) {
                App.ui.showMobileChatsMenu(true);
            }
            this.lastFilterType = currentFilterType;
        }, 200);
    };

    render() {
        const {
            className,
            userStatus,
            ...other
        } = this.props;

        const navbarWidth = Config.ui['navbar.width'];
        const userConfig = App.profile.userConfig;
        const isAvatarOnTop = userConfig && userConfig.avatarPosition === 'top';

        return (<div
            className={classes('app-navbar', className, {
                'with-avatar-on-top': isAvatarOnTop
            })}
            {...other}
        >
            <nav className={`dock-${isAvatarOnTop ? 'top' : 'bottom'} app-nav-profile`}>
                <div className="hint--right" data-hint={App.profile.summaryText}>
                    <a className="block relative app-profile-avatar" onClick={this.handleProfileAvatarClick}>
                        <UserAvatar className="avatar-lg relative" style={{margin: rem((navbarWidth - 36) / 2)}} size={36} user={App.profile.user} />
                        <StatusDot status={App.profile.userStatus} />
                    </a>
                </div>
                {this.state.showUserMenu && <UserMenu className={`dock-left dock-${isAvatarOnTop ? 'top' : 'bottom'}`} style={{left: rem(navbarWidth)}} onRequestClose={this.handleUserMenuRequestClose} />}
            </nav>
            <nav className="dock-top app-nav-main">
                {
                    navbarItems.map(item => {
                        return (<div key={item.to} className="hint--right nav-item" data-hint={item.label} onClick={this.handleMainNavItemClick}>
                            <NavLink item={item} />
                            {
                                (this.state.noticeBadge && item.to === ROUTES.chats.recents.__) ? <div className="label label-sm dock-right dock-top circle red badge">{this.state.noticeBadge}</div> : null
                            }
                        </div>);
                    })
                }
            </nav>
            {
                isAvatarOnTop && <nav className="dock-bottom">
                    <div className="hint--right" data-hint={Lang.string('common.settings')}>
                        <a className="block" onClick={this.handleSettingBtnClick}><Avatar size={navbarWidth} icon="settings" /></a>
                    </div>
                </nav>
            }
        </div>);
    }
}

export default Navbar;
