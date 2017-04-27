import React               from 'react';
import ReactDOM            from 'react-dom';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import Chat                from '../../models/chat/chat';
import Message             from '../../models/chat/chat-message';
import Member              from '../../models/member';
import StarBorderIcon      from 'material-ui/svg-icons/toggle/star-border';
import StarIcon            from 'material-ui/svg-icons/toggle/star';
import PersonAddIcon       from 'material-ui/svg-icons/social/person-add';
import SidebarIcon         from 'material-ui/svg-icons/action/chrome-reader-mode';
import ComtentTextIcon     from '../icons/comment-text';
import PoundIcon           from '../icons/pound-box';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import HistoryIcon         from 'material-ui/svg-icons/action/history';
import IconButton          from 'material-ui/IconButton';
import SplitJS             from 'split.js';
import ChatsIcon           from '../icons/comments-outline';
import MessageList         from './message-list';
import MessageSendbox      from './message-sendbox';
import Sidebar             from './sidebar';
import Resizable           from '../mixins/resizable';
import InviteMembers       from './invite-member';
import UserAvatar          from '../user-avatar';
import UserStatus          from './user-status';
import ChatsManager        from './chats-manager';
import Colors              from 'Utils/material-colors';
import R                   from 'Resource';
import Popover             from 'Components/popover';
import Spinner             from 'Components/spinner';
import Messager            from 'Components/messager';
import Emojione            from 'Components/emojione';
import Modal               from 'Components/modal';
import IconMenu            from 'material-ui/IconMenu';
import MenuItem            from 'material-ui/MenuItem';
import MoreVertIcon        from 'material-ui/svg-icons/navigation/more-vert';
import Divider             from 'material-ui/Divider';
import LockIcon            from 'material-ui/svg-icons/action/lock-outline';

// display app component
const ChatPage = React.createClass({
    mixins: [Resizable],

    getInitialState() {
        return {
            chat: null,
            smallWindow: false,
            sidebar: false
        };
    },

    toggleSidebar(expand, width, ignoreState) {
        let chat = App.chat.dao.getChat(this.props.chatGid);
        let sidebarConfig = this.sidebarConfig;
        if(!sidebarConfig) {
            sidebarConfig = App.user.getConfig(`ui.chat.sidebar.${chat.gid}`, {expand: !chat.isOne2One});
        }
        sidebarConfig.expand = expand;
        if(typeof width === 'number') {
            sidebarConfig.width = width;
        }
        this.sidebarConfig = sidebarConfig;
        App.user.setConfig(`ui.chat.sidebar.${chat.gid}`, sidebarConfig);
        if(!ignoreState) {
            this.setState({sidebar: expand});
        }
    },

    _initChat(chat) {
        chat = chat || this.state.chat || App.chat.dao.getChat(this.props.chatGid);
        if(!chat) {
            return;
        } else if(this._chatInited) {
            return;
        }
        this._chatInited = true;
        let sidebarConfig = App.user.getConfig(`ui.chat.sidebar.${chat.gid}`, {expand: !chat.isOne2One});
        this.setState({
            chat,
            sidebar: sidebarConfig.expand
        }, () => {
            let chatMessageBox = this.chatMessageBox;
            if(this.messageSendbox) {
                let messageSendboxHeight = Math.ceil(100 * App.user.getConfig('ui.chat.sendbox.height', 125) / chatMessageBox.clientHeight);
                SplitJS([ReactDOM.findDOMNode(this.messageList), ReactDOM.findDOMNode(this.messageSendbox)], {
                    direction: 'vertical',
                    gutterSize: 4,
                    sizes: [100 - messageSendboxHeight, messageSendboxHeight],
                    minSize: 90,
                    onDragEnd: () => {
                        this.messageList.scrollToBottom();
                    }
                });
            }
            sidebarConfig.width = Math.min(95, Math.max(5, sidebarConfig.width || Math.ceil(100 * 300 / this.chatBox.clientWidth)));
            this.colSpliter = SplitJS([ReactDOM.findDOMNode(this.mainCol), ReactDOM.findDOMNode(this.sidebarCol)], {
                direction: 'horizontal',
                gutterSize: 2,
                sizes: [100 - sidebarConfig.width , sidebarConfig.width],
                minSize: [450, 250],
                onDragEnd: e => {
                    this.sidebarConfig = {
                        width: this.colSpliter.getSizes()[1],
                        expand: true
                    };
                    App.user.setConfig(`ui.chat.sidebar.${chat.gid}`, this.sidebarConfig);
                }
            });
            if(!sidebarConfig.expand || this.state.smallWindow) {
                this.colSpliter.collapse(1);
            }
            this.sidebarConfig = sidebarConfig;
            this.messageList.scrollToBottom(1500);
        });

        if(chat.isCommitter(App.user)) {
            this._handleCaptureScreenEvent = App.on(R.event.capture_screen, (image, chat) => {
                if(image && chat && chat.gid === this.props.chatGid) {
                    this.messageSendbox.appendImages(image);
                }
            });

            this._handleUILinkEvent = App.on(R.event.ui_link, actionLink => {
                if(App.chat.activeChatWindow === this.props.chatGid && actionLink.action === '@Member') {
                    let editbox = this.messageSendbox.editbox;
                    editbox.appendContent('@' + actionLink.target + ' ');
                    editbox.focus(false);
                }
            });
        }
    },

    componentDidMount() {
        this._handleDataChangeEvent = App.on(R.event.data_change, data => {
            let chat = null;
            if(data.chats) {
                chat = data.chats.find(x => x.gid === this.props.chatGid);
            }
            if(chat && chat.gid === this.props.chatGid) {
                this.setState({chat}, () => {
                    this._initChat();
                });
            }
        });

        this._initChat();
    },

    componentWillUnmount() {
        App.off(this._handleDataChangeEvent, this._handleCaptureScreenEvent, this._handleUILinkEvent);
    },

    _sendMessage(messages) {
        const chat = this.state.chat;
        App.chat.sendMessage(messages, chat);
    },

    _sendEmojiMessage(emoticon) {
        const chat = this.state.chat;
        if(emoticon) {
            const message = new Message({
                contentType: 'image',
                content: JSON.stringify({type: 'emoji', content: emoticon}),
                sender: App.user,
                cgid: chat.gid,
                date: new Date()
            });
            this._sendMessage(message);
            return message;
        }
    },

    _handSendMessage(sendbox, emoticon) {
        let chat = this.state.chat;
        if(emoticon) {
            ths._sendEmojiMessage(emoticon);
        } else {
            sendbox.editbox.getContentList().forEach(content => {
                if(content.type === 'text') {
                    content.content = Emojione.toShort(content.content);
                    let trimContent = App.user.getConfig('ui.chat.sendHDEmoticon') ? content.content.trim() : false;
                    if(trimContent && Emojione.emojioneList[trimContent]) {
                        this._sendEmojiMessage(trimContent);
                    } else {
                        this._sendMessage(new Message({
                            content: content.content,
                            sender: App.user,
                            cgid: chat.gid,
                            date: new Date()
                        }));
                    }
                } else if(content.type === 'image') {
                    this._handleSelectImageFile(content.image);
                }
            });

            sendbox.clearContent();
            sendbox.focusInputArea();
        }
        
        this.setState({chat});
        this.messageList.scrollToBottom();
    },

    _handleStarButtonClick() {
        App.chat.toggleStar(this.state.chat);
    },

    _handleMakePublicMenuItemClick() {
        App.chat.togglePublic(this.state.chat);
    },

    _handleExitChatMenuItemClick() {
        App.chat.exitConfirm(this.state.chat);
    },

    _handleRenameChatMenuItemClick() {
        App.chat.renamePrompt(this.state.chat);
    },

    _handleChangeFontSizeMenuItemClick() {
        App.chat.changeChatFontSize();
    },

    _handleSetCommittersMenuItemClick() {
        App.chat.openCommittersDialog(this.state.chat);
    },

    onWindowResize(windowWidth) {
        this.setState({smallWindow: windowWidth < 900});
    },

    _handleSelectImageFile(file) {
        if(file && file.path) App.chat.sendImageMessage(this.state.chat, file);
    },

    _handleSelectFile(file) {
        App.chat.sendFileMessage(this.state.chat, file, err => {
            if(err.code) {
                Messager.show({clickAway: true, autoHide: false, content: Lang.errors[err.code], color: Theme.color.negative});
            }
        });
    },

    _handleOnInviteBtnClick(e) {
        const chat = this.state.chat;
        let members = [];
        Object.keys(App.dao.members).forEach(memberId => {
            if(!chat.members.has(Number.parseInt(memberId))) {
                members.push(App.dao.members[memberId]);
            }
        });

        e.persist();
        Popover.toggle({
            getLazyContent: () => <InviteMembers onInviteButtonClick={this._handleInviteMembers} members={members} chatId={this.props.chatGid} />,
            contentId: 'chat-' + this.props.chatGid,
            id: 'ChatInviteMemberPopover',
            trigger: this.inviteBtnWrapper,
            placement: 'bottom',
            removeAfterHide: true,
            arrowColor: Theme.color.accent2,
            style: {
                width: 500,
                height: 400
            },
        });
    },

    _handleInviteMembers(members) {
        App.chat.inviteMembers(this.state.chat, members);
        Popover.hide('ChatInviteMemberPopover', true);
    },

    _handleHistoryBtnClick() {
        Modal.show({
            id: 'chat-history',
            removeAfterHide: true,
            header: Lang.chat.chatsManager,
            content:  () => {
                return <ChatsManager chat={this.state.chat}/>;
            },
            style: {left: 20, top: 20, right: 20, bottom: 0, position: 'absolute'},
            actions: false
        });
    },

    _handleDndEnter(e) {
        e.target.classList.add('hover');
    },

    _handleDndLeave(e) {
        e.target.classList.remove('hover');
    },

    _handleDndDrop(e) {
        e.target.classList.remove('hover');
        let file = e.dataTransfer.files[0];
        if(file) {
            if(file.type.startsWith('image/')) {
                this.messageSendbox.appendImages(file);
            } else {
                this._handleSelectFile(file);
            }
        }
    },

    render() {
        const STYLE = {
            main: {},
            header: {
              borderBottom: '1px solid ' + Theme.color.border, 
              padding: '10px 0 10px 50px',
              lineHeight: '28px',
              backgroundColor: Theme.color.pale2,
              zIndex: 9
            },
            icon: {
                pointerEvents: 'none'
            },
            headerIcon: {
              position: 'absolute',
              left: 15,
              top: 12
            },
            headAvatar: {
                position: 'absolute',
                left: 18,
                top: 14
            },
            headerTitle: {
              fontWeight: 500,
              fontSize: '14px'
            },
            headerActions: {
              right: 0
            },
            messageList: {
              top: 49,
            },
            sidebar: {
                transition: Theme.transition.normal('width', 'opacity', 'visibility')
            },
            sidebarHide: {
                width: 0,
                overflow: 'hidden',
                opacity: 0,
                visibility: 'hidden'
            },
            publicGroup: {
                color: Theme.color.alternateText,
                backgroundColor: Colors.lightGreen500,
                display: 'inline-block',
                marginLeft: 10,
                lineHeight: '16px',
                padding: '1px 3px',
                borderRadius: 2,
            },
            menuItem: {
                fontSize: '13px'
            }
        };
        
        let {
            style,
            chatId,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);
        const chat = this.state.chat;

        if(!chat) {
            return <div {...other} style={style}><Spinner/></div>
        }

        let messageListStyle = Object.assign({}, STYLE.messageList);

        let sidebarIconButton = null, sidebarStyle = STYLE.sidebar;
        if(!this.state.sidebar || this.state.smallWindow) {
            if(!this.state.smallWindow) sidebarIconButton = <IconButton className="hint--bottom" data-hint={Lang.chat.openSidebar} onClick={() => this.toggleSidebar(true)}><SidebarIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/></IconButton>;
            sidebarStyle = Object.assign({}, sidebarStyle, STYLE.sidebarHide);
            if(this.colSpliter) {
                this.colSpliter.collapse(1);
            }
        } else if(this.colSpliter) {
            let sidebarWidth = this.sidebarConfig.width;
            this.colSpliter.setSizes([100 - sidebarWidth, sidebarWidth]);
        }

        let ChatStarIcon = chat.star ? StarIcon : StarBorderIcon;
        let chatIcon = chat.isOne2One ? <UserAvatar size={20} user={chat.getTheOtherOne(App.user)} style={STYLE.headAvatar}/> : chat.isSystem ? <ComtentTextIcon color={Colors.indigo500} style={STYLE.headerIcon}/> : chat.public ? <PoundIcon color={Colors.lightGreen700} style={STYLE.headerIcon}/> : <ChatsIcon color={Colors.lightBlue500} style={STYLE.headerIcon}/>;
        
        let theOtherOne = chat.getTheOtherOne(App.user);
        let chatTitle = theOtherOne ? <a className="link-app" href={'#Member/' + theOtherOne.id} title={'@' + theOtherOne.displayName} ><UserStatus status={theOtherOne ? theOtherOne.status : null} />{chat.getDisplayName(App)}</a> : chat.getDisplayName(App);

        let canMakePublic = chat.canMakePublic(App.user);
        let canSetCommitters = chat.canSetCommitters(App.user);
        let canRename = chat.canRename(App.user);
        let chatMenu = <IconMenu
            desktop={true}
            iconButtonElement={<IconButton className="hint--bottom" data-hint={Lang.common.more}><MoreVertIcon color={Theme.color.icon} hoverColor={Theme.color.primary1} style={STYLE.icon} /></IconButton>}
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            listStyle={{paddingTop: 8, paddingBottom: 8}}
            >
            {canMakePublic ? <MenuItem onClick={this._handleMakePublicMenuItemClick} style={STYLE.menuItem} primaryText={chat.public ? Lang.chat.cancelSetPublic : Lang.chat.setPublic} /> : null}
            {canRename ? <MenuItem onClick={this._handleRenameChatMenuItemClick} style={STYLE.menuItem} primaryText={Lang.common.rename} />: null}
            {canSetCommitters ? <MenuItem onClick={this._handleSetCommittersMenuItemClick} style={STYLE.menuItem} primaryText={Lang.chat.setCommitters} /> : null}
            {chat.canExit ? <MenuItem onClick={this._handleExitChatMenuItemClick} style={STYLE.menuItem} primaryText={Lang.chat.exitChat} /> : null}
            {canSetCommitters || canMakePublic || canRename || chat.canExit ? <Divider /> : null}
            <MenuItem onClick={this._handleChangeFontSizeMenuItemClick} style={STYLE.menuItem} primaryText={Lang.chat.changeFontSize} />
        </IconMenu>;

        let messagesView = [];
        if(chat.isCommitter(App.user)) {
            messagesView.push(<MessageList key="messae-list" ref={e => {this.messageList = e;}} messages={chat.messages} chatId={chat.gid} className='user-selectable messages-list split split-vertical scroll-y'/>);
            messagesView.push(<MessageSendbox key="message-sendbox" ref={e => {this.messageSendbox = e;}} className='split split-vertical' onSelectFile={this._handleSelectFile} onSendButtonClick={this._handSendMessage} placeholder={(canRename && chat.isNewChat) ? Lang.chat.sendboxPlaceholderForNewChat : ((theOtherOne && theOtherOne.isOffline) ? (Lang.chat.sendboxPlaceholder + ' (' + Lang.chat.sendboxOfflinePlacehoder + ')') : Lang.chat.sendboxPlaceholder)} chatId={chat.gid}/>);
            messagesView.push(<div key="chat-dnd-box" className="drag-n-drop-message center-block" onDragEnter={this._handleDndEnter} onDrop={this._handleDndDrop} onDragLeave={this._handleDndLeave}>
                <div className="text-center">
                <div className="dnd-over" dangerouslySetInnerHTML={{__html: Emojione.toImage(':hatching_chick:')}}></div>
                <div className="dnd-hover" dangerouslySetInnerHTML={{__html: Emojione.toImage(':hatched_chick:')}}></div>
                <h1>{Lang.chat.drapNDropFileMessage}</h1>
                </div>
            </div>);
        } else {
            messagesView.push(<MessageList key="messae-list" ref={e => {this.messageList = e;}} messages={chat.messages} chatId={chat.gid} className='user-selectable messages-list dock-full scroll-y' style={{bottom: 40}}/>);
            messagesView.push(<div className="dock-bottom" key="blockedCommitterTip" style={{lineHeight: '24px', padding: '8px 10px 8px 40px', backgroundColor: 'rgba(0,0,0,.1)', color: Theme.color.icon}}><LockIcon color={Theme.color.icon} style={{position: 'absolute', top: 7, left: 8}} /> {Lang.chat.blockedCommitterTip}</div>);
        }

        return <div {...other} style={style}>
          <div className='dock-full' ref={e => {this.chatBox = e;}}>
            <div className='relative split split-horizontal' ref={(e) => this.mainCol = e}>
              <header className='dock-top' style={STYLE.header}>
                <div>{chatIcon}<span style={STYLE.headerTitle}>{chatTitle}</span>{chat.public ? <small className="hint--bottom" data-hint={Lang.chat.publicGroupTip} style={STYLE.publicGroup}>{Lang.chat.publicGroup}</small> : null}</div>
                <div className='dock-right' style={STYLE.headerActions}>
                  <IconButton className="hint--bottom" data-hint={chat.star ? Lang.chat.removeStar : Lang.chat.star} onClick={this._handleStarButtonClick}><ChatStarIcon color={chat.star ? Theme.color.accent1 : Theme.color.icon} hoverColor={chat.star ? Theme.color.accent1 : Theme.color.primary1}/></IconButton>
                  {chat.canInvite(App.user) ? <div ref={(e) => this.inviteBtnWrapper = e} style={{display: 'inline-block'}}><IconButton className="hint--bottom" onClick={this._handleOnInviteBtnClick} data-hint={Lang.chat.inviteMember}><PersonAddIcon color={Theme.color.icon} hoverColor={Theme.color.primary1} style={STYLE.icon}/></IconButton></div> : null}
                  {<IconButton className="hint--bottom" onClick={this._handleHistoryBtnClick} data-hint={Lang.chat.history}><HistoryIcon color={Theme.color.icon} hoverColor={Theme.color.primary1} style={STYLE.icon}/></IconButton>}
                  {sidebarIconButton}
                  {chatMenu}
                </div>
              </header>
              <div className='dock-full' style={messageListStyle} ref={e => {this.chatMessageBox = e;}}>{messagesView}</div>
            </div>
            <div className='relative split split-horizontal' ref={(e) => this.sidebarCol = e}>
              {this.state.sidebar ? <Sidebar style={sidebarStyle} chat={chat} className='dock-full' onCloseButtonClick={() => {this.toggleSidebar(false);}}/> : null}
            </div>
          </div>
        </div>
    }
});

export default ChatPage;
