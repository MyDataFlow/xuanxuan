import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Member from '../../core/models/member';
import {MemberListItem} from './member-list-item';
import replaceViews from '../replace-views';
import ListItem from '../../components/list-item';
import Lang from '../../lang';
import App from '../../core';

class MemberList extends Component {
    static get MemberList() {
        return replaceViews('common/member-list', MemberList);
    }

    static propTypes = {
        members: PropTypes.arrayOf(PropTypes.instanceOf(Member)).isRequired,
        listItemProps: PropTypes.object,
        onItemClick: PropTypes.func,
        onItemContextMenu: PropTypes.func,
        itemRender: PropTypes.func,
        contentRender: PropTypes.func,
        className: PropTypes.string,
        avatarClassName: PropTypes.string,
        heading: PropTypes.any,
        startPageSize: PropTypes.number,
        morePageSize: PropTypes.number,
        defaultPage: PropTypes.number,
        eventBindObject: PropTypes.object,
    }

    static defaultProps = {
        listItemProps: null,
        onItemClick: null,
        onItemContextMenu: null,
        className: null,
        avatarClassName: null,
        itemRender: null,
        contentRender: null,
        heading: null,
        startPageSize: 20,
        morePageSize: 10,
        defaultPage: 1,
        eventBindObject: null
    };

    constructor(props) {
        super(props);
        this.state = {page: props.defaultPage};
    }

    handleRequestMorePage = () => {
        this.setState({page: this.state.page + 1});
    };

    handleOnItemClick = e => {
        const {onItemClick, eventBindObject} = this.props;
        if (onItemClick) {
            const member = App.members.get(e.currentTarget.attributes['data-id'].value);
            onItemClick.call(eventBindObject, member, e);
        }
    };

    handleOnItemContextMenu = e => {
        const {onItemContextMenu, eventBindObject} = this.props;
        if (onItemContextMenu) {
            const member = App.members.get(e.currentTarget.attributes['data-id'].value);
            onItemContextMenu.call(eventBindObject, member, e);
        }
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
            heading,
            startPageSize,
            morePageSize,
            defaultPage,
            contentRender,
            eventBindObject,
            ...other
        } = this.props;

        const listViews = [];
        const {page} = this.state;
        const maxIndex = page ? Math.min(members.length, startPageSize + (page > 1 ? (page - 1) * morePageSize : 0)) : members.length;
        for (let i = 0; i < maxIndex; i += 1) {
            const member = members[i];
            if (itemRender) {
                listViews.push(itemRender(member));
            } else {
                let itemProps = null;
                if (typeof listItemProps === 'function') {
                    itemProps = listItemProps(member);
                } else {
                    itemProps = listItemProps;
                }
                listViews.push(<MemberListItem data-id={member.id} avatarClassName={avatarClassName} onContextMenu={this.handleOnItemContextMenu} onClick={this.handleOnItemClick} {...itemProps} key={member.account} member={member}>{contentRender && contentRender(member)}</MemberListItem>);
            }
        }
        const notShowCount = members.length - maxIndex;
        if (notShowCount) {
            listViews.push(<ListItem key="showMore" icon="chevron-double-down" className="flex-middle item muted" title={<span className="title small">{Lang.format('common.clickShowMoreFormat', notShowCount)}</span>} onClick={this.handleRequestMorePage} />);
        }

        return (<div
            {...other}
            className={HTML.classes('app-member-list list', className)}
        >
            {heading}
            {listViews}
        </div>);
    }
}

export default MemberList;
