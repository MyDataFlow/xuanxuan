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
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-member-list list', className)}
        >
        {
            members.map(member => {
                return <MemberListItem {...listItemProps} key={member.account} member={member}/>;
            })
        }
        </div>;
    }
}

export default MemberList;
