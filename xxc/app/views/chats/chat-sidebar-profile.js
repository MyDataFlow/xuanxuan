import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import App from '../../core';
import {MemberProfile} from '../common/member-profile';
import replaceViews from '../replace-views';

class ChatSidebarProfile extends Component {
    static propTypes = {
        className: PropTypes.string,
        chat: PropTypes.object,
        children: PropTypes.any,
    };

    static defaultProps = {
        className: null,
        chat: null,
        children: null,
    };

    static get ChatSidebarProfile() {
        return replaceViews('chats/chat-sidebar-profile', ChatSidebarProfile);
    }

    constructor(props) {
        super(props);
        const {chat} = this.props;
        this.member = chat.getTheOtherOne(App);
    }

    componentDidMount() {
        this.dataChangeEventHandler = App.events.onDataChange(data => {
            if (this.member && data && data.members && data.members[this.member.id]) {
                this.forceUpdate();
            }
        });
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.className !== this.props.className || nextProps.chat !== this.props.chat || nextProps.children !== this.props.children || nextProps.chat.getTheOtherOne(App).updateId !== this.lastMemberUpdateId;
    }

    componentWillUnmount() {
        App.events.off(this.dataChangeEventHandler);
    }

    render() {
        const {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const member = chat.getTheOtherOne(App);
        this.lastMemberUpdateId = member.updateId;

        return (<div
            {...other}
            className={HTML.classes('app-chat-sidebar-profile has-padding', className)}
        >
            <MemberProfile compact hideChatBtn className="rounded white" memberId={member.id} />
            {children}
        </div>);
    }
}

export default ChatSidebarProfile;
