import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import App from '../../core';
import ChatCreateGroups from './chat-create-groups';
import ChatJoinPublic from './chat-join-public';

class ChatCreateView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            type: 'normal'
        };
    }

    changeType(type) {
        this.setState({type});
    }

    render() {
        let {
            className,
            children,
            onRequestClose,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-chat-create dock-bottom row single', className)}
        >
            <div className="primary-pale column single flex-none">
                <div className="list-item divider flex-none">
                    <Avatar icon="arrow-right" iconClassName="text-muted icon-2x"/>
                    <div className="title">{Lang.string('chat.create.chatTypeTip')}</div>
                </div>
                <div className="scroll-y flex-auto lighten">
                    <div className="list compact app-chat-create-types-menu">
                        <a onClick={this.changeType.bind(this, 'normal')} className={"item" + (this.state.type === 'normal' ? ' white text-primary' : '')}>
                            <Avatar icon="account-multiple-outline" iconClassName="text-blue icon-2x"/>
                            <div className="title">{Lang.string('chat.create.chatType.normal')}</div>
                        </a>
                        <a onClick={this.changeType.bind(this, 'public')} className={"item" + (this.state.type === 'public' ? ' white text-primary' : '')}>
                            <Avatar icon="pound-box" iconClassName="text-green icon-2x"/>
                            <div className="title">{Lang.string('chat.create.chatType.public')}</div>
                        </a>
                    </div>
                </div>
            </div>
            {this.state.type === 'normal' ? <ChatCreateGroups onRequestClose={onRequestClose}/> :
            <ChatJoinPublic onRequestClose={onRequestClose}/>}
            {children}
        </div>;
    }
}

export default ChatCreateView;
