import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import App from '../../core';
import FileList from '../common/file-list';
import Emojione from '../../components/emojione';
import Spinner from '../../components/spinner';

class ChatSidebarFiles extends Component {

    constructor(props) {
        super(props);
        this.state = {
            files: [],
            loading: true
        };
    }

    loadFiles() {
        const chat = this.props.chat;
        App.im.chats.getChatFiles(chat).then(files => {
            this.setState({files, loading: false});
        });
    }

    componentDidMount() {
        this.loadFiles();
    }

    renderLoading() {
        return <div className="dock center-content" style={{top: HTML.rem(50)}}>
            <Spinner label={Lang.string('chat.sidebar.tab.files.loading')}/>
        </div>;
    }

    renderEmptyFileList() {
        return <div className="dock center-content" style={{top: HTML.rem(50)}}>
            <div>
                <div className="text-center" dangerouslySetInnerHTML={{__html: Emojione.toImage(':blowfish:')}}></div>
                <div className="text-gray small">{Lang.string('chat.sidebar.tab.files.noFilesHere')}</div>
            </div>
        </div>;
    }

    renderFileList(files) {
        return <FileList listItemProps={{smallIcon: true, showSender: true}} className="white rounded" files={files}/>;
    }

    render() {
        let {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const {files, loading} = this.state;

        return <div {...other}
            className={HTML.classes('app-chat-sidebar-files has-padding', className)}
        >
            {
                loading ? this.renderLoading() : files.length ? this.renderFileList(files) : this.renderEmptyFileList()
            }
            {children}
        </div>;
    }
}

export default ChatSidebarFiles;
