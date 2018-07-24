import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Avatar from '../../components/avatar';
import Lang from '../../lang';
import {ChatCreateGroups} from './chat-create-groups';
import {ChatJoinPublic} from './chat-join-public';
import replaceViews from '../replace-views';

class ChatCreateView extends PureComponent {
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

    static get ChatCreateView() {
        return replaceViews('chats/chat-create', ChatCreateView);
    }

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
        const {
            className,
            children,
            onRequestClose,
            ...other
        } = this.props;

        return (<div
            {...other}
            className={HTML.classes('app-chat-create dock-bottom row single', className)}
        >
            <div className="primary-pale column single flex-none">
                <div className="list-item divider flex-none">
                    <Avatar icon="arrow-right" iconClassName="text-muted icon-2x" />
                    <div className="title">{Lang.string('chat.create.chatTypeTip')}</div>
                </div>
                <div className="scroll-y flex-auto lighten">
                    <div className="list compact app-chat-create-types-menu">
                        <a onClick={this.changeType.bind(this, 'normal')} className={'item' + (this.state.type === 'normal' ? ' white text-primary' : '')}>
                            <Avatar icon="account-multiple-outline" iconClassName="text-blue icon-2x" />
                            <div className="title">{Lang.string('chat.create.chatType.normal')}</div>
                        </a>
                        <a onClick={this.changeType.bind(this, 'public')} className={'item' + (this.state.type === 'public' ? ' white text-primary' : '')}>
                            <Avatar icon="access-point" iconClassName="text-green icon-2x" />
                            <div className="title">{Lang.string('chat.create.chatType.public')}</div>
                        </a>
                    </div>
                </div>
            </div>
            {this.state.type === 'normal' ? <ChatCreateGroups onRequestClose={onRequestClose} /> : <ChatJoinPublic onRequestClose={onRequestClose} />}
            {children}
        </div>);
    }
}

export default ChatCreateView;
