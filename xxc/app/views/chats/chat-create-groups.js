import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import App from '../../core';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import SearchControl from '../../components/search-control';
import Messager from '../../components/messager';
import {MemberListItem} from '../common/member-list-item';
import ROUTES from '../common/routes';
import replaceViews from '../replace-views';
import {MemberList} from '../common/member-list';

class ChatCreateGroups extends Component {
    static propTypes = {
        onRequestClose: PropTypes.func,
        className: PropTypes.string,
        children: PropTypes.any,
    };

    static defaultProps = {
        onRequestClose: null,
        className: null,
        children: null,
    };

    static get ChatCreateGroups() {
        return replaceViews('chats/chat-create-groups', ChatCreateGroups);
    }

    constructor(props) {
        super(props);

        const user = App.user;
        this.state = {
            choosed: {[user.id]: user},
            search: '',
        };
        this.members = App.members.query(x => (!x.isDeleted), true);
    }

    handleSearchChange = search => {
        search = search && search.toLowerCase();
        this.setState({search});
    }

    handleSelectAllClick = () => {
        const {choosed} = this.state;
        this.members.forEach(member => {
            choosed[member.id] = member;
        });
        this.setState({choosed});
    }

    handleSelectInverseClick = () => {
        const {choosed} = this.state;
        const userId = App.profile.userId;
        this.members.forEach(member => {
            if (member.id !== userId) {
                if (choosed[member.id]) {
                    delete choosed[member.id];
                } else {
                    choosed[member.id] = member;
                }
            }
        });
        this.setState({choosed});
    }

    handleCreateBtnClick = () => {
        const members = Object.keys(this.state.choosed);
        if (members.length <= 2) {
            window.location.hash = `#${ROUTES.chats.contacts.id(App.im.chats.getOne2OneChatGid(members))}`;
            if (this.props.onRequestClose) {
                this.props.onRequestClose();
            }
        } else {
            App.im.ui.createGroupChat(members).then(newChat => {
                if (newChat) {
                    window.location.hash = `#${ROUTES.chats.groups.id(newChat.gid)}`;
                }
                if (this.props.onRequestClose) {
                    this.props.onRequestClose();
                }
            }).catch(error => {
                if (error) {
                    Messager.show(Lang.error(error));
                }
            });
        }
    }

    handleMemberItemClick(member) {
        if (member.id === App.profile.userId) {
            Messager.show(Lang.string('chat.create.mustInclueYourself'), {type: 'warning', autoHide: true});
        } else {
            const {choosed} = this.state;
            if (choosed[member.id]) {
                delete choosed[member.id];
            } else {
                choosed[member.id] = member;
            }
            this.setState({choosed});
        }
    }

    isMatchSearch(member) {
        const {search} = this.state;
        if (!search.length) {
            return true;
        }
        const account = member.account && member.account.toLowerCase();
        const realname = member.realname && member.realname.toLowerCase();
        return account.includes(search) || realname.includes(search) || member.id === search;
    }

    isChoosed(member) {
        return member.id === App.profile.userId || !!this.state.choosed[member.id];
    }

    renderMemberItem = member => {
        if (this.isMatchSearch(member)) {
            const isChoosed = this.isChoosed(member);
            return <MemberListItem className={isChoosed ? 'primary-pale' : ''} onClick={this.handleMemberItemClick.bind(this, member)} key={member.id} member={member}>{isChoosed && <Icon name="check text-success" />}</MemberListItem>;
        }
        return null;
    };

    render() {
        const {
            className,
            children,
            onRequestClose,
            ...other
        } = this.props;

        const choosedCount = Object.keys(this.state.choosed).length;
        let theOtherOne = null;
        if (choosedCount === 2) {
            const userId = `${App.profile.userId}`;
            const otherOneId = Object.keys(this.state.choosed).find(x => x !== userId);
            theOtherOne = this.state.choosed[otherOneId];
        }

        return (<div
            {...other}
            className={HTML.classes('app-chat-create-groups column single', className)}
        >
            <div className="list-item divider flex-none">
                <Avatar icon="arrow-right" iconClassName="text-muted icon-2x" />
                <div className="title">{Lang.string('chat.create.groupsTip')}</div>
                <div className="flex-none">
                    <button type="button" onClick={this.handleCreateBtnClick} disabled={choosedCount < 2} className="btn primary rounded">{choosedCount < 2 ? Lang.string('chat.create.title') : choosedCount === 2 ? Lang.format('chat.create.chatWith.format', theOtherOne.displayName) : Lang.format('chat.create.group.format', choosedCount)}</button>
                </div>
            </div>
            <div className="white cell">
                <div className="column single">
                    <div className="cell heading flex-none has-padding">
                        <nav className="flex-auto">
                            <a className="btn text-primary rounded" onClick={this.handleSelectAllClick}>{Lang.string('common.selectAll')}</a>
                            <a className="btn text-primary rounded" onClick={this.handleSelectInverseClick}>{Lang.string('common.selectInverse')}</a>
                        </nav>
                        <SearchControl defaultValue={this.state.search} onSearchChange={this.handleSearchChange} className="flex-none" style={{width: HTML.rem(200)}} />
                    </div>
                    <div className="cell scroll-y has-padding-sm">
                        <MemberList className="fluid compact app-chat-create-groups-member-list" members={this.members} itemRender={this.renderMemberItem} />
                    </div>
                </div>
            </div>
            {children}
        </div>);
    }
}

export default ChatCreateGroups;
