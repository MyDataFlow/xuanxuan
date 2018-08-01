import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import Member from '../../core/models/member';
import ROUTES from '../common/routes';
import {UserAvatar} from './user-avatar';
import {StatusDot} from './status-dot';
import replaceViews from '../replace-views';

class MemberProfile extends Component {
    static get MemberProfile() {
        return replaceViews('common/member-profile', MemberProfile);
    }

    static propTypes = {
        memberId: PropTypes.any.isRequired,
        className: PropTypes.string,
        compact: PropTypes.bool,
        hideChatBtn: PropTypes.bool,
        onRequestClose: PropTypes.func,
    }

    static defaultProps = {
        className: null,
        onRequestClose: null,
        compact: false,
        hideChatBtn: false,
    };

    componentDidMount() {
        this.dataChangeEventHandler = App.events.onDataChange(data => {
            if (data && data.members && data.members[this.props.memberId]) {
                this.forceUpdate();
            }
        });
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.compact !== this.props.compact || nextProps.className !== this.props.className || nextProps.hideChatBtn !== this.props.hideChatBtn || nextProps.onRequestClose !== this.props.onRequestClose || nextProps.memberId !== this.props.memberId;
    }

    componentWillUnmount() {
        App.events.off(this.dataChangeEventHandler);
    }

    render() {
        const {
            memberId,
            className,
            onRequestClose,
            hideChatBtn,
            compact,
            ...other
        } = this.props;

        const member = App.members.get(memberId);
        const roleName = member.getRoleName(App);
        const deptName = member.getDeptName(App);

        return (<div
            {...other}
            className={HTML.classes('app-member-profile space user-selectable', className, {compact})}
        >
            <header className="list-item flex-middle space-sm">
                <UserAvatar className="avatar-xl flex-none" user={member} />
                <div className="content has-padding">
                    <h3 className="title strong">{member.displayName} <small className="muted">@{member.account}</small></h3>
                    <div className="flex flex-middle infos">
                        <StatusDot status={member.status} label />
                        {member.gender ? <div>{member.gender === 'f' ? <Icon name="human-female text-purple" /> : <Icon name="human-male text-blue" />}{Lang.string(`member.gender.${member.gender}`)}</div> : null}
                        {roleName ? <div><Icon name="account-card-details text-gray" />{roleName}</div> : null}
                        {(roleName && deptName) ? '·' : null}
                        {deptName ? <div>{(!roleName) ? <Icon name="account-card-details text-gray" /> : null}{deptName}</div> : null}
                    </div>
                </div>
                {!hideChatBtn && !member.isDeleted && member.account !== App.profile.userAccount && <a href={`#${ROUTES.chats.contacts.id([member.id, App.profile.user.id].sort().join('&'))}`} onClick={onRequestClose} className="btn btn-lg rounded text-primary primary-pale"><Icon name="comment-text-outline" /> &nbsp;{Lang.string('member.profile.sendMessage')}</a>}
            </header>
            <div className="divider" />
            <div className="heading">
                <div className="title small text-gray">{Lang.string('member.profile.contactInfo')}</div>
            </div>
            {member.mobile && <div className="list-item contact-info-item">
                <Avatar icon="cellphone" className="flex-none circle blue" />
                <div className="content">
                    <div className="subtitle">{Lang.string('member.profile.mobile')}</div>
                    <input type="input" className="input clean" readOnly value={member.mobile} />
                </div>
            </div>}
            {member.email && <div className="list-item contact-info-item">
                <Avatar icon="email" className="flex-none circle red" />
                <div className="content">
                    <div className="subtitle">{Lang.string('member.profile.email')}</div>
                    <input type="input" className="input clean" readOnly value={member.email} />
                </div>
            </div>}
            {member.phone && <div className="list-item contact-info-item">
                <Avatar icon="phone" className="flex-none circle green" />
                <div className="content">
                    <div className="subtitle">{Lang.string('member.profile.phone')}</div>
                    <input type="input" className="input clean" readOnly value={member.phone} />
                </div>
            </div>}
        </div>);
    }
}

export default MemberProfile;
