import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import Member from '../../core/models/member';
import UserAvatar from './user-avatar';
import Avatar from '../../components/avatar';
import StatusDot from './status-dot';
import ROUTES from '../common/routes';

class MemberProfile extends Component {

    render() {
        let {
            member,
            className,
            children,
            onRequestClose,
            hideChatBtn,
            compact,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-member-profile space user-selectable', className, {compact})}
        >
            <header className="list-item flex-middle space-sm">
                <UserAvatar className="avatar-xl flex-none" user={member}/>
                <div className="content has-padding">
                    <h3 className="title strong">{member.displayName} <small className="muted">@{member.account}</small></h3>
                    <div className="flex flex-middle">
                        <StatusDot status={member.status} label={true}/> &nbsp; &nbsp;
                        <span>{Lang.string(`member.gender.${member.gender}`)}</span> &nbsp; &nbsp;
                        <span>{Lang.string(`member.role.${member.role}`)}</span>
                    </div>
                </div>
                {!hideChatBtn && member.account !== App.profile.userAccount && <a href={'#' + ROUTES.chats.contacts.id([member.id, App.profile.user.id].sort().join('&'))} onClick={onRequestClose} className="btn btn-lg rounded text-primary primary-pale"><Icon name="comment-text-outline"/> {Lang.string('member.profile.sendMessage')}</a>}
            </header>
            <div className="divider"></div>
            <div className="heading">
                <div className="title small text-gray">{Lang.string('member.profile.contactInfo')}</div>
            </div>
            {member.mobile && <div className="list-item contact-info-item">
                <Avatar icon="cellphone" className="flex-none circle blue"/>
                <div className="content">
                    <div className="subtitle">{Lang.string('member.profile.mobile')}</div>
                    <input type="input" className="input clean" readOnly value={member.mobile}/>
                </div>
            </div>}
            {member.email && <div className="list-item contact-info-item">
                <Avatar icon="email" className="flex-none circle red"/>
                <div className="content">
                    <div className="subtitle">{Lang.string('member.profile.email')}</div>
                    <input type="input" className="input clean" readOnly value={member.email}/>
                </div>
            </div>}
            {member.phone && <div className="list-item contact-info-item">
                <Avatar icon="phone" className="flex-none circle green"/>
                <div className="content">
                    <div className="subtitle">{Lang.string('member.profile.phone')}</div>
                    <input type="input" className="input clean" readOnly value={member.phone}/>
                </div>
            </div>}

        </div>;
    }
}

export default MemberProfile;
