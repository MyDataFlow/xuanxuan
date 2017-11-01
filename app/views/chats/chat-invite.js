import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Avatar from '../../components/avatar';
import Messager from '../../components/messager';
import Lang from '../../lang';
import App from '../../core';
import MemberListItem from '../common/member-list-item';
import ROUTES from '../common/routes';

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

    constructor(props) {
        super(props);
        this.state = {
            choosed: {}
        };
    }

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
                if (newChat) {
                    const groupUrl = `#${ROUTES.chats.groups.id(newChat.gid)}`;
                    this.requestClose();
                    App.im.server.sendBoardChatMessage(Lang.format('chat.inviteAndCreateNewChat.format', `[**[${newChat.getDisplayName(App)}](${groupUrl})**]`), chat);
                    window.location.hash = groupUrl;
                }
            }).catch(error => {
                if (error) {
                    Messager.show(Lang.error(error), {type: 'danger'});
                }
            });
        } else {
            App.im.server.inviteMembersToChat(chat, members).then(chat => {
                if (chat) {
                    const broadcast = App.im.server.createBoardChatMessage(Lang.format('chat.inviteMembersJoinChat.format', members.map(x => `@${x.account}`).join('、')), chat);
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

        const {choosed} = this.state;
        const choosedItems = [];
        const items = [];
        App.members.forEach(member => {
            if (!chat.isMember(member)) {
                if (choosed[member.id]) {
                    choosedItems.push(member);
                } else {
                    items.push(member);
                }
            }
        });

        return (<div
            {...other}
            className={HTML.classes('app-chat-invite single column', className)}
        >
            <div className="heading heading-lg flex-none primary-pale">
                <Avatar icon="account-plus text-gray" />
                <div className="title">{Lang.string('chat.invite.title')}</div>
                <div className="has-padding-h">
                    <button type="button" disabled={!choosedItems.length} className="btn primary rounded btn-wide" onClick={this.handleInviteBtnClick}>{Lang.string('chat.invite')}</button>
                </div>
            </div>
            <div className="flex-auto">
                <div className="scroll-y" style={{maxHeight: 352}}>
                    {
                        choosedItems.length ? <div className="list compact divider space-sm">
                            <div className="heading fluid">
                                <div className="title text-accent">{Lang.string('chat.invite.choosed')} ({choosedItems.length})</div>
                            </div>
                            {
                                choosedItems.map(member => {
                                    return <MemberListItem onClick={this.handleMemberItemClick.bind(this, member)} key={member.id} member={member} />;
                                })
                            }
                            <div className="space-sm fluid" />
                        </div> : null
                    }
                    <div className="list compact">
                        {
                            items.map(member => {
                                return <MemberListItem key={member.id} onClick={this.handleMemberItemClick.bind(this, member)} member={member} />;
                            })
                        }
                    </div>
                </div>
            </div>
        </div>);
    }
}

export default ChatInvite;
