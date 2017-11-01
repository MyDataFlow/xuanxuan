import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Member from '../../core/models/member';
import MemberListItem from './member-list-item';

class MemberList extends Component {
    static propTypes = {
        members: PropTypes.arrayOf(PropTypes.instanceOf(Member)).isRequired,
        listItemProps: PropTypes.object,
        onItemClick: PropTypes.func,
        onItemContextMenu: PropTypes.func,
        itemRender: PropTypes.func,
        className: PropTypes.string,
        avatarClassName: PropTypes.string,
    }

    static defaultProps = {
        listItemProps: null,
        onItemClick: null,
        onItemContextMenu: null,
        className: null,
        avatarClassName: null,
        itemRender: null,
    };

    render() {
        const {
            members,
            className,
            listItemProps,
            itemRender,
            onItemClick,
            onItemContextMenu,
            avatarClassName,
            ...other
        } = this.props;

        return (<div
            {...other}
            className={HTML.classes('app-member-list list', className)}
        >
            {
                members.map(member => {
                    return <MemberListItem avatarClassName={avatarClassName} onContextMenu={onItemContextMenu && onItemContextMenu.bind(null, member)} onClick={onItemClick && onItemClick.bind(null, member)} {...listItemProps} key={member.account} member={member}>{itemRender && itemRender(member)}</MemberListItem>;
                })
            }
        </div>);
    }
}

export default MemberList;
