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
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-member-profile list space user-selectable', className)}
        >
            <div className="item flex-middle space-sm">
                <UserAvatar className="avatar-xl" user={member}/>
                <div className="content has-padding">
                    <h3 className="title strong">{member.displayName} <small className="muted">@{member.account}</small></h3>
                    <div className="flex flex-middle">
                        <StatusDot status={member.status} label={true}/> &nbsp; &nbsp;
                        <span>{Lang.string(`member.gender.${member.gender}`)}</span> &nbsp; &nbsp;
                        <span>{Lang.string(`member.role.${member.role}`)}</span>
                    </div>
                </div>
                {member.account !== App.profile.userAccount && <a href={'#' + ROUTES.chats.contacts.id([member.id, App.profile.user.id].sort().join('&'))} onClick={onRequestClose} className="btn btn-lg rounded text-primary primary-pale"><Icon name="comment-text-outline"/> {Lang.string('member.profile.sendMessage')}</a>}
            </div>
            <div className="divider"></div>
            <div className="heading">
                <div className="title">{Lang.string('member.profile.contactInfo')}</div>
            </div>
            {member.mobile && <div className="item">
                <Avatar icon="cellphone" className="circle blue"/>
                <div className="content">
                    <div className="subtitle">{Lang.string('member.profile.mobile')}</div>
                    <div className="title">{member.mobile}</div>
                </div>
            </div>}
            {member.email && <div className="item">
                <Avatar icon="email" className="circle red"/>
                <div className="content">
                    <div className="subtitle">{Lang.string('member.profile.email')}</div>
                    <div className="title">{member.email}</div>
                </div>
            </div>}
            {member.phone && <div className="item">
                <Avatar icon="phone" className="circle green"/>
                <div className="content">
                    <div className="subtitle">{Lang.string('member.profile.phone')}</div>
                    <div className="title">{member.phone}</div>
                </div>
            </div>}

        </div>;
    }
}

export default MemberProfile;
