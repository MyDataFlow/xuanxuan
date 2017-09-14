import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import Member from '../../core/models/member';
import MemberListItem from './member-list-item';

class MemberList extends Component {

    render() {
        let {
            members,
            className,
            children,
            listItemProps,
            itemRender,
            onItemClick,
            onItemContextMenu,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-member-list list', className)}
        >
        {
            members.map(member => {
                return <MemberListItem onContextMenu={onItemContextMenu && onItemContextMenu.bind(null, member)} onClick={onItemClick && onItemClick.bind(null, member)} {...listItemProps} key={member.account} member={member}>{itemRender && itemRender(member)}</MemberListItem>;
            })
        }
        </div>;
    }
}

export default MemberList;
