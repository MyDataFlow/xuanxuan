import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import MemberProfile from '../common/member-profile';

class ChatSidebarProfile extends Component {

    constructor(props) {
        super(props);
        const {chat} = this.props;
        this.member = chat.getTheOtherOne(App);
    }

    componentWillUnmount() {
        App.events.off(this.dataChangeEventHandler);
    }

    componentDidMount() {
        this.dataChangeEventHandler = App.events.onDataChange(data => {
            if(this.member && data && data.members && data.members[this.member.id]) {
                this.forceUpdate();
            }
        });
    }


    render() {
        let {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const member = chat.getTheOtherOne(App);

        return <div {...other}
            className={HTML.classes('app-chat-sidebar-profile has-padding', className)}
        >
            <MemberProfile compact={true} hideChatBtn={true} className="rounded white" member={member}/>
            {children}
        </div>;
    }
}

export default ChatSidebarProfile;
