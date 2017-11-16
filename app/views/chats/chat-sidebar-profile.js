import React, {Component, PropTypes} from 'react';
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

        return (<div
            {...other}
            className={HTML.classes('app-chat-sidebar-profile has-padding', className)}
        >
            <MemberProfile compact hideChatBtn className="rounded white" member={member} />
            {children}
        </div>);
    }
}

export default ChatSidebarProfile;
