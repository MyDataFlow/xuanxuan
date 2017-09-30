import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import FileList from '../common/file-list';
import Emojione from '../../components/emojione';

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

        const {files} = this.state;

        return <div {...other}
            className={HTML.classes('app-chat-sidebar-files has-padding', className)}
        >
            {
                files.length ? <FileList listItemProps={{smallIcon: true, showSender: true}} className="white rounded" files={files}/> : <div className="dock center-content">
                    <div>
                        <div className="text-center" dangerouslySetInnerHTML={{__html: Emojione.toImage(':blowfish:')}}></div>
                        <div className="text-gray">{Lang.string('chat.sidebar.tab.files.noFilesHere')}</div>
                    </div>
                </div>
            }

            {children}
        </div>;
    }
}

export default ChatSidebarFiles;
