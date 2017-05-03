import React, {Component}            from 'react';
import ReactDOM                      from 'react-dom';
import {
    Editor,
    EditorState,
    RichUtils,
    Entity,
    AtomicBlockUtils,
    convertToRaw,
    CompositeDecorator,
    Modifier
}                                    from 'draft-js';
import Theme                         from 'Theme';
import Emojione                      from 'Components/emojione';
import Helper                        from 'Helper';

const AtomicComponent = props => {
    const key = props.block.getEntityAt(0)
    if (!key) {
        return null
    }
    const entity = Entity.get(key);
    const type = entity.getType();
    if (type === 'image') {
        const data = entity.getData();
        return <img
            className="draft-editor-image"
            src={data.src}
            alt={data.alt || ''}
        />;
    } else if(type === 'emoji') {
        let emoji = entity.getData().emoji;
        let emojionePngPath = Emojione.imagePathPNG + emoji.unicode + '.png' + Emojione.cacheBustParam;
        return <span><img className='emojione' style={{maxWidth: 20, maxHeight: 20}} contentEditable='false' data-offset-key={props.offsetKey} src={emojionePngPath} alt={Emojione.shortnameToUnicode(emoji.shortname)} title={emoji.name} />&nbsp;</span>;
    }
    return null;
};


const findWithRegex = (regex, contentBlock, callback) => {
    const text = contentBlock.getText();
    let matchArr, start;
    while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
};
const draftDecorator = new CompositeDecorator([{
    strategy: (contentBlock, callback, contentState) => {
        findWithRegex(/:[a-zA-Z0-9_]+:/g, contentBlock, callback);
    },
    component: (props) => {
        let shortname = props.decoratedText.trim();
        let emoji = Emojione.emojioneList[shortname];
        if(emoji) {
            let emojionePngPath = Emojione.imagePathPNG + emoji.fname + '.' + Emojione.imageType + Emojione.cacheBustParam;
            let backgroundImage = 'url(' + emojionePngPath + ') no-repeat left top';
            return <span title={shortname} data-offset-key={props.offsetKey} style={{width: 16, height: 16, display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap', background: backgroundImage, backgroundSize: 'contain', textAlign: 'left', verticalAlign: 'bottom'}}><span style={{color: 'transparent'}}>{props.children}</span> </span>;
        }
        return <span data-offset-key={props.offsetKey}>{props.children}</span>;
    }
}, {
    strategy: (contentBlock, callback, contentState) => {
        findWithRegex(/@[\u4e00-\u9fa5_\w]+[，。,\.\/\s:@\n]/g, contentBlock, callback);
    },
    component: (props) => {
        let guess = props.decoratedText.substr(1).trim().replace(/[，。,\.\/\s:@\n]/g, '');
        if(guess) {
            let member = App.dao.guessMember(guess);
            if(member) {
                return <a className="link-app" href={'#Member/' + member.id} title={'@' + member.displayName} style={{color: Theme.color.primary1}} data-offset-key={props.offsetKey}>{props.children}</a>;
            }
        }
        return <span data-offset-key={props.offsetKey}>{props.children}</span>;
    }
}]);

class DraftEditor extends Component {

    constructor(props) {
        super(props);
        this.state = {editorState: EditorState.createEmpty(draftDecorator)};
    }

    getContent() {
        return this.state.editorState.getCurrentContent().getPlainText();
    }

    clearContent() {
        this.onChange(EditorState.createEmpty(draftDecorator));
    }

    appendContent(content, asNewLine, callback) {
        const editorState = this.state.editorState;
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const ncs = Modifier.insertText(contentState, selection, content);
        const newEditorState = EditorState.push(editorState, ncs, 'insert-fragment');
        this.onChange(newEditorState, callback);
    }

    appendEmojione(emoji, callback) {
        this.appendContent(Emojione.shortnameToUnicode(emoji.shortname), callback);
    }

    appendEmojioneEntity(emoji, callback) {
        let {editorState} = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'emoji',
            'Segmented',
            {emoji: emoji, content: emoji.shortname}
        );
        const newEditorState = EditorState.set(
            editorState,
            {currentContent: contentStateWithEntity}
        );
        this.onChange(newEditorState, callback);
    }

    appendImage(image, callback) {
        let {editorState} = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'image',
            'IMMUTABLE',
            {src: image.path, alt: image.name || '', image: image}
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(
            editorState,
            {currentContent: contentStateWithEntity}
        );
        this.onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '), callback);
    }

    getContentList() {
        let contents = [];
        const editorState = this.state.editorState;
        const contentState = editorState.getCurrentContent();
        const raw = convertToRaw(contentState);
        let thisTextContent = '';
        raw.blocks.forEach(block => {
            if(block.type === 'atomic') {
                if(block.entityRanges && block.entityRanges.length) {
                    contents.push({type: 'image', image: raw.entityMap[block.entityRanges[0].key].data.image});
                }
                if(thisTextContent.length) {
                    contents.push({type: 'text', content: thisTextContent});
                    thisTextContent = '';
                }
            } else {
                if(thisTextContent.length) {
                    thisTextContent += '\n';
                }
                thisTextContent += block.text;
            }
        });
        if(thisTextContent.length) {
            contents.push({type: 'text', content: thisTextContent});
            thisTextContent = '';
        }
        return contents;
    }

    focus(delay = 100) {
        setTimeout(() => {
            this.editor.focus();
        }, delay);
    }

    onChange(editorState, callback) {
        const contentState = editorState.getCurrentContent();
        this.setState({editorState}, () => {
            callback && callback(contentState);
            this.props.onChange && this.props.onChange(contentState);
        });
    }

    handleKeyCommand(command) {
        if(!this.props.handleKey) {
            return;
        }
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    handleReturn(e) {
        if(this.props.onReturnKeyDown) {
            return this.props.onReturnKeyDown(e);
        }
        return 'not-handled';
    }

    handlePastedText(text, html) {
        this.appendContent(text);
        return 'handled';
    }

    blockRendererFn(contentBlock) {
        const type = contentBlock.getType();
        let result = null;

        if (type === 'atomic') {
            result = {
                component: AtomicComponent,
                editable: true,
            }
        }

        return result
    }

    render() {
        let {
            placeholder,
            ...other
        } = this.props;

        return <div {...other} onClick={e => {this.focus(0);}}>
            <Editor
                ref={e => {this.editor = e;}}
                placeholder={placeholder}
                editorState={this.state.editorState} 
                onChange={this.onChange.bind(this)}
                handleKeyCommand={this.handleKeyCommand.bind(this)}
                handleReturn={this.handleReturn.bind(this)}
                blockRendererFn={this.blockRendererFn.bind(this)}
                handlePastedText={this.handlePastedText.bind(this)}
            />
        </div>;
    }
}

export default DraftEditor;
