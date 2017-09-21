import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import FileList from '../common/file-list';

class ChatSidebarFiles extends Component {

    constructor(props) {
        super(props);
        this.state = {
            files: []
        };
    }

    loadFiles() {
        const chat = this.props.chat;
        App.im.chats.getChatFiles(chat).then(files => {
            this.setState({files});
        });
    }

    componentDidMount() {
        this.loadFiles();
    }

    render() {
        let {
            chat,
            className,
            children,
            ...other
        } = this.props;

        return <div {...other}
            className={HTML.classes('app-chat-sidebar-files has-padding', className)}
        >
            <FileList listItemProps={{smallIcon: true, showSender: true}} className="white rounded" files={this.state.files}/>
            {children}
        </div>;
    }
}

export default ChatSidebarFiles;
