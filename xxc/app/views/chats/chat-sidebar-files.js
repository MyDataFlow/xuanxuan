import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import App from '../../core';
import Emojione from '../../components/emojione';
import Spinner from '../../components/spinner';
import {FileList} from '../common/file-list';
import replaceViews from '../replace-views';

const renderLoading = () => {
    return (<div className="dock center-content" style={{top: HTML.rem(50)}}>
        <Spinner label={Lang.string('chat.sidebar.tab.files.loading')} />
    </div>);
};

const renderEmptyFileList = () => {
    return (<div className="dock center-content" style={{top: HTML.rem(50)}}>
        <div>
            <div className="text-center" dangerouslySetInnerHTML={{__html: Emojione.toImage(':blowfish:')}} />
            <div className="text-gray small">{Lang.string('chat.sidebar.tab.files.noFilesHere')}</div>
        </div>
    </div>);
};

const renderFileList = files => {
    return <FileList listItemProps={{smallIcon: true, showSender: true}} className="white rounded" files={files} />;
};

class ChatSidebarFiles extends Component {
    static get ChatSidebarFiles() {
        return replaceViews('chats/chat-sidebar-files', ChatSidebarFiles);
    }

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

    constructor(props) {
        super(props);
        this.state = {
            files: [],
            loading: true
        };
    }

    componentDidMount() {
        this.loadFiles();
    }

    loadFiles() {
        const chat = this.props.chat;
        return App.im.chats.getChatFiles(chat).then(files => {
            return this.setState({files, loading: false});
        });
    }

    render() {
        let {
            chat,
            className,
            children,
            ...other
        } = this.props;

        const {files, loading} = this.state;

        return (<div
            {...other}
            className={HTML.classes('app-chat-sidebar-files has-padding', className)}
        >
            {
                loading ? renderLoading() : files.length ? renderFileList(files) : renderEmptyFileList()
            }
            {children}
        </div>);
    }
}

export default ChatSidebarFiles;
