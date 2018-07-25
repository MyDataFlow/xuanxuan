import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import StringHelper from '../../utils/string-helper';
import SearchControl from '../../components/search-control';
import Messager from '../../components/messager';
import Lang from '../../lang';
import App from '../../core';
import {MemberList} from '../common/member-list';
import ROUTES from '../common/routes';
import replaceViews from '../replace-views';

class ChatInvite extends Component {
    static propTypes = {
        chat: PropTypes.object,
        className: PropTypes.string,
        children: PropTypes.any,
        onRequestClose: PropTypes.func,
    };

    static defaultProps = {
        chat: null,
        className: null,
        children: null,
        onRequestClose: null,
    };

    static get ChatInvite() {
        return replaceViews('chats/chat-invite', ChatInvite);
    }

    constructor(props) {
        super(props);
        this.state = {
            choosed: {},
            search: '',
        };
    }

    handleSearchChange = search => {
        this.setState({search});
    };

    handleMemberItemClick(member) {
        const {choosed} = this.state;
        if (choosed[member.id]) {
            delete choosed[member.id];
        } else {
            choosed[member.id] = member;
        }
        this.setState({choosed});
    }

    requestClose() {
        if (this.props.onRequestClose) {
            this.props.onRequestClose();
        }
    }

    handleInviteBtnClick = e => {
        const {chat} = this.props;
        const {choosed} = this.state;
        const members = Object.keys(choosed).map(memberId => choosed[memberId]);
        if (chat.isOne2One) {
            members.push(...chat.getMembersSet(App.members));
            App.im.ui.createGroupChat(members).then(newChat => {
                const groupUrl = `#${ROUTES.chats.groups.id(newChat.gid)}`;
                this.requestClose();
                App.im.server.sendBoardChatMessage(Lang.format('chat.inviteAndCreateNewChat.format', `@${App.profile.user.account}`, `[**[${newChat.getDisplayName(App)}](${groupUrl})**]`), chat);
                window.location.hash = groupUrl;
            }).catch(error => {
                if (error) {
                    Messager.show(Lang.error(error), {type: 'danger'});
                }
            });
        } else {
            App.im.server.inviteMembersToChat(chat, members).then(chat => {
                if (chat) {
                    const broadcast = App.im.server.createBoardChatMessage(Lang.format('chat.inviteMembersJoinChat.format', `@${App.profile.user.account}`, members.map(x => `@${x.account}`).join('、')), chat);
                    App.im.server.sendChatMessage(broadcast, chat);
                }
                this.requestClose();
            }).catch(error => {
                if (error) {
                    Messager.show(Lang.error(error), {type: 'danger'});
                }
            });
        }
    }

    render() {
        const {
            chat,
            className,
            children,
            onRequestClose,
            ...other
        } = this.props;

        const {choosed, search} = this.state;
        const choosedItems = [];
        const items = [];
        const keys = StringHelper.isEmpty(search) ? null : search.trim().toLowerCase().split(' ');
        App.members.forEach(member => {
            if (!chat.isMember(member)) {
                if (choosed[member.id]) {
                    choosedItems.push(member);
                } else if (!keys || member.getMatchScore(keys)) {
                    items.push(member);
                }
            }
        }, true);

        return (<div
            {...other}
            className={HTML.classes('app-chat-invite single row outline space', className)}
        >
            <div className="cell column single flex-none gray" style={{width: HTML.rem(150)}}>
                <div className="has-padding-sm flex-none darken">
                    <SearchControl onSearchChange={this.handleSearchChange} />
                </div>
                <MemberList className="flex-auto scroll-y compact" members={items} onItemClick={this.handleMemberItemClick} eventBindObject={this} listItemProps={{avatarSize: 24}} />
            </div>
            <div className="cell column single flex-auto divider-left">
                <div className="heading flex-none primary-pale">
                    <div className="title text-accent flex-auto">{Lang.string('chat.invite.choosed')} ({choosedItems.length})</div>
                    <div className="flex-none has-padding-h"><button type="button" disabled={!choosedItems.length} className="btn primary rounded btn-wide" onClick={this.handleInviteBtnClick}>{Lang.string('chat.invite')}</button></div>
                </div>
                <MemberList className="flex-auto scroll-y compact" members={choosedItems} onItemClick={this.handleMemberItemClick} eventBindObject={this} listItemProps={{avatarSize: 24}} />
            </div>
        </div>);
    }
}

export default ChatInvite;
