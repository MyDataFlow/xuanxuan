import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import Member from '../../core/models/member';
import UserAvatar from './user-avatar';
import StatusDot from './status-dot';

class MemberListItem extends Component {

    static defaultProps = {
        avatarSize: 30,
        showStatusDot: true,
        className: 'flex-middle'
    };

    render() {
        let {
            member,
            avatarSize,
            avatarClassName,
            showStatusDot,
            className,
            children,
            ...other
        } = this.props;

        return <a {...other}
            className={HTML.classes('app-member-list-item item', className)}
        >
            <UserAvatar className={avatarClassName} size={avatarSize} user={member}/>
            {showStatusDot && <StatusDot status={member.status}/>}
            <div className="title">{member.displayName}</div>
        </a>;
    }
}

export default MemberListItem;
