import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import {UserAvatar} from './user-avatar';
import StatusDot from './status-dot';
import Member from '../../core/models/member';
import replaceViews from '../replace-views';

class MemberListItem extends Component {
    static get MemberListItem() {
        return replaceViews('common/member-list-item', MemberListItem);
    }

    static propTypes = {
        member: PropTypes.instanceOf(Member).isRequired,
        avatarSize: PropTypes.number,
        showStatusDot: PropTypes.bool,
        className: PropTypes.string,
        avatarClassName: PropTypes.string,
        title: PropTypes.any,
        children: PropTypes.any,
    }

    static defaultProps = {
        avatarSize: 30,
        showStatusDot: true,
        className: 'flex-middle',
        avatarClassName: null,
        title: null,
        children: null,
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.children !== this.props.children || nextProps.className !== this.props.className || nextProps.avatarSize !== this.props.avatarSize || nextProps.showStatusDot !== this.props.showStatusDot || nextProps.avatarClassName !== this.props.avatarClassName || nextProps.title !== this.props.title || nextProps.member !== this.props.member || nextProps.member.updateId !== this.lastMemberUpdateId;
    }

    render() {
        const {
            member,
            avatarSize,
            avatarClassName,
            showStatusDot,
            className,
            children,
            title,
            ...other
        } = this.props;

        this.lastMemberUpdateId = member.updateId;

        let titleView = null;
        if (title) {
            if (React.isValidElement(title)) {
                titleView = title;
            } else {
                titleView = <div className="title">{title}</div>;
            }
        } else {
            titleView = <div className="title">{member.displayName}</div>;
        }

        return (<a
            {...other}
            className={HTML.classes('app-member-list-item item', className)}
        >
            <UserAvatar className={avatarClassName} size={avatarSize} user={member} />
            {showStatusDot && <StatusDot status={member.status} />}
            {titleView}
            {children}
        </a>);
    }
}

export default MemberListItem;
