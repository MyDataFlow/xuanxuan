import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from 'App';
import Spinner             from '../components/spinner';
import FileListItem        from './file-list-item';
import ContentNotReady     from '../misc/content-not-ready';
import R                   from 'Resource';

const FileList = React.createClass({

    getInitialState() {
        return {files: null}
    },

    _loadFiles(chatId) {
        if(!chatId) chatId = this.props.chatId;
        if(chatId) {
            App.chat.dao.getChatFiles(chatId).then(files => {
                if(files && Array.isArray(files)) {
                    files.sort((x, y) => y.date - x.date);
                }
                this.setState({files});
                this.props.onFilesLoad && this.props.onFilesLoad(files);
            });
        }
    },

    componentDidMount() {
        this._loadFiles();
        this._handleDataChangeEvent = App.on(R.event.data_change, data => {
            if(data.chats && data.chats.find(x => x.gid === this.props.chatId)) {
                this._loadFiles();
            }
        });
    },

    componentWillUnmount() {
        App.off(this._handleDataChangeEvent);
    },

    render() {
        const STYLE = {
            item: {
                padding: 8,
                paddingRight: 0,
                borderBottom: '1px solid ' + Theme.color.border,
                width: '100%',
                backgroundColor: Theme.color.canvas,
                boxSizing: 'border-box'
            }
        };

        let {
            style,
            itemStyle,
            showFileIcon,
            chatId,
            files,
            ...other
        } = this.props;

        if(this.state.files) {
            files = this.state.files;
        }

        let filesContent = null;
        if(files) {
            if(files.length) {
                filesContent = files.map(file => {
                    return <FileListItem icon={showFileIcon ? '' : false} showTime={true} showUser={true} style={Object.assign({}, STYLE.item, itemStyle)} key={file.gid} file={file} />;
                });
            } else {
                filesContent = <ContentNotReady iconName=':blowfish:' title={Lang.chat.emptyFileList}/>
            }
        }

        return <div {...other} style={style}>
            {filesContent ? filesContent : <Spinner/>}
        </div>
    }
});

export default FileList;
