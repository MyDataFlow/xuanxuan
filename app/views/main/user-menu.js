import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import ClickOutsideWrapper from '../../components/click-outside-wrapper';
import Lang from '../../lang';
import App from '../../core';
import StatusDot from '../common/status-dot';
import User from '../../core/profile/user';

const allStatus = [
    User.STATUS.getName(User.STATUS.online),
    User.STATUS.getName(User.STATUS.busy),
    User.STATUS.getName(User.STATUS.away),
];

class UserMenu extends Component {

    handleStatusClick(status) {
        App.server.changeUserStatus(status);
        this.requestClose();
    }

    handleLogoutClick = () => {
        App.server.logout();
        this.requestClose();
    }

    requestClose() {
        this.props.onRequestClose && this.props.onRequestClose();
    }

    render() {
        let {
            onRequestClose,
            className,
            children,
            ...other
        } = this.props;

        let userStatus = App.profile.userStatus;
        const userStatusName = userStatus && User.STATUS.getName(userStatus);

        return <ClickOutsideWrapper {...other}
            onClickOutside={onRequestClose}
            className={HTML.classes('app-usermenu layer text-dark list', className)}
        >
            {
                allStatus.map(statusName => {
                    return <a key={statusName} onClick={this.handleStatusClick.bind(this, statusName)} className="item flex-middle">
                        <StatusDot status={statusName}/>
                        <div className="title">{Lang.string(`member.status.${statusName}`)}</div>
                        {userStatusName === statusName && <Icon name="check" className="text-green"/>}
                    </a>;
                })
            }
            <div className="divider"></div>
            <a className="item"><div className="title">{Lang.string('usermenu.openProfile')}</div></a>
            <div className="divider"></div>
            <a className="item"><div className="title">{Lang.string('usermenu.about')}</div></a>
            <a className="item"><div className="title">{Lang.string('usermenu.setting')}</div></a>
            <a className="item" onClick={this.handleLogoutClick}><div className="title">{Lang.string('usermenu.logout')}</div></a>
            <a className="item"><div className="title">{Lang.string('usermenu.exit')}</div></a>
        </ClickOutsideWrapper>;
    }
}

export default UserMenu;
