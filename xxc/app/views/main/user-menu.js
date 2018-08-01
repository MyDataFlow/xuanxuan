import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Platform from 'Platform';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import ClickOutsideWrapper from '../../components/click-outside-wrapper';
import Lang from '../../lang';
import App from '../../core';
import {StatusDot} from '../common/status-dot';
import User from '../../core/profile/user';
import UserProfileDialog from '../common/user-profile-dialog';
import AboutDialog from '../common/about-dialog';
import UserSettingDialog from '../common/user-setting-dialog';
import UserChangePasswordDialog from '../common/user-change-password-dialog';
import replaceViews from '../replace-views';

const allStatus = [
    User.STATUS.getName(User.STATUS.online),
    User.STATUS.getName(User.STATUS.busy),
    User.STATUS.getName(User.STATUS.away),
];

const isBrowser = Platform.type === 'browser';

class UserMenu extends Component {
    static get UserMenu() {
        return replaceViews('main/user-menu', UserMenu);
    }

    static defaultProps = {
        onRequestClose: null,
        children: null,
        className: null,
    };

    static propTypes = {
        onRequestClose: PropTypes.func,
        children: PropTypes.any,
        className: PropTypes.string
    };

    handleStatusClick(status) {
        App.server.changeUserStatus(status);
        this.requestClose();
    }

    handleLogoutClick = () => {
        App.server.logout();
        this.requestClose();
    }

    handleExitClick = () => {
        App.ui.quit();
    }

    requestClose = () => {
        if (this.props.onRequestClose) {
            this.props.onRequestClose();
        }
    }

    handleUserProfileItemClick = () => {
        UserProfileDialog.show();
        this.requestClose();
    };

    handleAboutItemClick = () => {
        AboutDialog.show();
        this.requestClose();
    };

    handleSettingItemClick = () => {
        UserSettingDialog.show();
        this.requestClose();
    };

    handleChangePasswordClick = () => {
        UserChangePasswordDialog.show();
    };

    render() {
        const {
            onRequestClose,
            className,
            children,
            ...other
        } = this.props;

        const userStatus = App.profile.userStatus;
        const userStatusName = userStatus && User.STATUS.getName(userStatus);

        return (<ClickOutsideWrapper
            {...other}
            onClickOutside={onRequestClose}
            className={HTML.classes('app-usermenu layer text-dark list', className)}
        >
            {
                allStatus.map(statusName => {
                    return (<a key={statusName} onClick={this.handleStatusClick.bind(this, statusName)} className="item flex-middle">
                        <StatusDot status={statusName} />
                        <div className="title">{Lang.string(`member.status.${statusName}`)}</div>
                        {userStatusName === statusName && <Icon name="check" className="text-green" />}
                    </a>);
                })
            }
            <div className="divider" />
            <a className="item" onClick={this.handleUserProfileItemClick}><div className="title">{Lang.string('usermenu.openProfile')}</div></a>
            <a className="item" onClick={this.handleChangePasswordClick}><div className="title">{Lang.string('usermenu.changePassword')}</div></a>
            <div className="divider" />
            <a className="item" onClick={this.handleAboutItemClick}><div className="title">{Lang.string('usermenu.about')}</div></a>
            <a className="item" onClick={this.handleSettingItemClick}><div className="title">{Lang.string('usermenu.setting')}</div></a>
            {isBrowser ? null : <a className="item" href="#/exts/app/themes" onClick={this.requestClose}><div className="title">{Lang.string('exts.themes.label')}</div></a>}
            <a className="item" onClick={this.handleLogoutClick}><div className="title">{Lang.string('usermenu.logout')}</div></a>
            {App.ui.canQuit && <a className="item" onClick={this.handleExitClick}><div className="title">{Lang.string('usermenu.exit')}</div></a>}
            {children}
        </ClickOutsideWrapper>);
    }
}

export default UserMenu;
