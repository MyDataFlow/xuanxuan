import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import MemberList from '../common/member-list';
import Member from '../../core/models/member';


class ChatSidebarPeoples extends Component {

    componentWillUnmount() {
        App.events.off(this.dataChangeEventHandler);
    }

    componentDidMount() {
        this.dataChangeEventHandler = App.events.onDataChange(data => {
            if(data && data.members) {
                this.forceUpdate();
            }
        });
    }

    handleItemRender = member => {
        const {chat} = this.props;
        if(!chat.isCommitter(member)) {
            return <div data-hint={Lang.string('chat.committers.blocked')} className="hint--left side-icon text-gray"><Icon name="lock-outline"/></div>;
        }
        if(chat.isAdmin(member)) {
            return <div data-hint={Lang.string('chat.role.admin')} className="hint--left side-icon text-primary"><Icon name="account-circle"/></div>;
        }
        return null;
    }

    render() {
        let {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const userAccount = App.profile.userAccount;
        const members = Member.sort(chat.getMembersSet(App.members), [(x, y) => {
            if(x.account === userAccount) return -1;
            if(y.account === userAccount) return 1;
            const xIsAdmin = chat.isAdmin(x);
            const yIsAdmin = chat.isAdmin(y);
            if(xIsAdmin && !yIsAdmin) return -1;
            if(yIsAdmin && !xIsAdmin) return 1;
            return 0;
        }, 'status', 'namePinyin', '-id']);

        return <div {...other}
            className={HTML.classes('app-chat-sidebar-peoples has-padding', className)}
        >
            <MemberList itemRender={this.handleItemRender} className="white rounded compact" members={members} listItemProps={{avatarSize: 20}}/>
            {children}
        </div>;
    }
}

export default ChatSidebarPeoples;
