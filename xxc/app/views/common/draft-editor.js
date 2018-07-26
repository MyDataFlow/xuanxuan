import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    Editor,
    EditorState,
    RichUtils,
    Entity,
    AtomicBlockUtils,
    convertToRaw,
    CompositeDecorator,
    Modifier
} from 'draft-js';
import Emojione from '../../components/emojione';
import App from '../../core';
import timeSequence from '../../utils/time-sequence';
import Lang from '../../lang';
import replaceViews from '../replace-views';

/* eslint-disable */
const AtomicComponent = props => {
    const key = props.block.getEntityAt(0);
    if (!key) {
        return null;
    }
    const entity = Entity.get(key);
    const type = entity.getType();
    if (type === 'image') {
        const data = entity.getData();
        return (<img
            className="draft-editor-image"
            src={data.src}
            alt={data.alt || ''}
        />);
    } else if (type === 'emoji') {
        const emoji = entity.getData().emoji;
        const emojionePngPath = Emojione.imagePathPNG + emoji.unicode + '.png' + Emojione.cacheBustParam;
        return <span><img className="emojione" style={{maxWidth: 20, maxHeight: 20}} contentEditable="false" data-offset-key={props.offsetKey} src={emojionePngPath} alt={Emojione.shortnameToUnicode(emoji.shortname)} title={emoji.name} />&nbsp;</span>;
    }
    return null;
};

const findWithRegex = (regex, contentBlock, callback) => {
    const text = contentBlock.getText();
    let matchArr;
    let start;
    while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
};
const langAtAll = Lang.string('chat.message.atAll');
const draftDecorator = new CompositeDecorator([{
    strategy: (contentBlock, callback, contentState) => {
        findWithRegex(Emojione.regUnicode, contentBlock, callback);
    },
    component: (props) => {
        const unicode = props.decoratedText.trim();
        const map = Emojione.mapUnicodeCharactersToShort();
        const emoji = Emojione.emojioneList[map[unicode]];
        if (emoji) {
            console.log('emoji', emoji, Emojione);
            const emojionePngPath = Emojione.imagePathPNG + emoji.uc_base + '.' + Emojione.imageType;
            const backgroundImage = 'url(' + emojionePngPath + ') no-repeat left top';
            return <span title={unicode} data-offset-key={props.offsetKey} style={{width: 16, height: 16, display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap', background: backgroundImage, backgroundSize: 'contain', textAlign: 'right', verticalAlign: 'bottom', position: 'relative', top: -2, fontSize: '16px', color: 'transparent'}}>{props.children}</span>;
        }
        return <span data-offset-key={props.offsetKey}>{props.children}</span>;
    }
}, {
    strategy: (contentBlock, callback, contentState) => {
        findWithRegex(/@[\u4e00-\u9fa5_\w]+[，。,\.\/\s:@\n]/g, contentBlock, callback);
    },
    component: (props) => {
        const guess = props.decoratedText.substr(1).trim().replace(/[，。,\.\/\s:@\n]/g, '');
        if (guess) {
            if (guess === 'all' || guess === langAtAll) {
                return <span title={langAtAll} className="at-all text-primary" data-offset-key={props.offsetKey}>{props.children}</span>;
            } else {
                const member = App.members.guess(guess);
                if (member && member.id) {
                    return <a className="app-link text-primary" href={'@Member/' + member.id} title={'@' + member.displayName} data-offset-key={props.offsetKey}>{props.children}</a>;
                }
            }
        }
        return <span data-offset-key={props.offsetKey}>{props.children}</span>;
    }
}, {
    strategy: (contentBlock, callback, contentState) => {
        findWithRegex(/(https?):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g, contentBlock, callback);
    },
    component: (props) => {
        const url = props.decoratedText;
        return <a className="text-primary" data-offset-key={props.offsetKey} href={url}>{props.children}</a>;
    }
}]);
/* eslint-enable */

class DraftEditor extends PureComponent {
    static get DraftEditor() {
        return replaceViews('common/draft-editor', DraftEditor);
    }

    static propTypes = {
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        handleKey: PropTypes.bool,
        onReturnKeyDown: PropTypes.func,
        onPastedText: PropTypes.func,
        onPastedFiles: PropTypes.func,
    };

    static defaultProps = {
        placeholder: null,
        onChange: null,
        onReturnKeyDown: null,
        onPastedText: null,
        onPastedFiles: null,
        handleKey: false,
    };

    constructor(props) {
        super(props);
        this.state = {editorState: EditorState.createEmpty(draftDecorator)};

        this.onChange = this.onChange.bind(this);
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.handleReturn = this.handleReturn.bind(this);
        this.blockRendererFn = this.blockRendererFn.bind(this);
        this.handlePastedText = this.handlePastedText.bind(this);
        this.handlePastedFiles = this.handlePastedFiles.bind(this);
    }

    getContent() {
        return this.state.editorState.getCurrentContent().getPlainText();
    }

    clearContent() {
        this.onChange(EditorState.createEmpty(draftDecorator));
    }

    appendContent(content, asNewLine, callback) {
        if (content !== null && content !== undefined) {
            const editorState = this.state.editorState;
            const selection = editorState.getSelection();
            const contentState = editorState.getCurrentContent();
            const ncs = Modifier.insertText(contentState, selection, content);
            const newEditorState = EditorState.push(editorState, ncs, 'insert-fragment');
            this.onChange(newEditorState, callback);
        }
    }

    appendEmojione(emoji, callback) {
        this.appendContent(Emojione.shortnameToUnicode(emoji.shortname), callback);
    }

    appendImage(image, callback) {
        const {editorState} = this.state;
        const contentState = editorState.getCurrentContent();
        let imageSrc = image.path || image.url;
        if (!imageSrc) {
            if (image.blob) {
                imageSrc = URL.createObjectURL(image.blob);
            } else if (image instanceof Blob || image instanceof File) {
                imageSrc = URL.createObjectURL(image);
            }
        } else if (!imageSrc.startsWith('http://') && !imageSrc.startsWith('https://')) {
            imageSrc = `file://${imageSrc}`;
        }
        const contentStateWithEntity = contentState.createEntity(
            'image',
            'IMMUTABLE',
            {src: imageSrc, alt: image.name || '', image}
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(
            editorState,
            {currentContent: contentStateWithEntity}
        );
        this.onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '), callback);
    }

    getContentList() {
        const contents = [];
        const editorState = this.state.editorState;
        const contentState = editorState.getCurrentContent();
        const raw = convertToRaw(contentState);
        let thisTextContent = '';
        raw.blocks.forEach(block => {
            if (block.type === 'atomic') {
                if (thisTextContent.length && thisTextContent.trim().length) {
                    contents.push({type: 'text', content: thisTextContent});
                    thisTextContent = '';
                }
                if (block.entityRanges && block.entityRanges.length) {
                    contents.push({type: 'image', image: raw.entityMap[block.entityRanges[0].key].data.image});
                }
            } else {
                if (thisTextContent.length) {
                    thisTextContent += '\n';
                }
                thisTextContent += block.text;
            }
        });
        if (thisTextContent.length && thisTextContent.trim().length) {
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
            if (callback) {
                callback(contentState);
            }
            if (this.props.onChange) {
                this.props.onChange(contentState);
            }
        });
    }

    handleKeyCommand(command) {
        if (!this.props.handleKey) {
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
        if (this.props.onReturnKeyDown) {
            return this.props.onReturnKeyDown(e);
        }
        return 'not-handled';
    }

    handlePastedText(text, html) {
        if (this.props.onPastedText) {
            this.props.onPastedText(text, html);
        } else {
            this.appendContent(text || html);
        }
        return 'handled';
    }

    handlePastedFiles(files) {
        if (this.props.onPastedFiles) {
            this.props.onPastedFiles(files);
        } else {
            const date = new Date();
            files.forEach(blob => {
                if (blob.type.startsWith('image/')) {
                    this.appendImage({
                        lastModified: date.getTime(),
                        lastModifiedDate: date,
                        name: `clipboard-image-${timeSequence()}.png`,
                        size: blob.size,
                        blob,
                        type: blob.type
                    });
                }
            });
        }
        return 'handled';
    }

    blockRendererFn(contentBlock) {
        const type = contentBlock.getType();
        let result = null;

        if (type === 'atomic') {
            result = {
                component: AtomicComponent,
                editable: true,
            };
        }

        return result;
    }

    render() {
        const {
            placeholder,
            onReturnKeyDown,
            onPastedFiles,
            onPastedText,
            handleKey,
            ...other
        } = this.props;

        return (<div {...other} onClick={() => {this.focus(0);}}>
            <Editor
                ref={e => {this.editor = e;}}
                placeholder={placeholder}
                editorState={this.state.editorState}
                onChange={this.onChange}
                handleKeyCommand={this.handleKeyCommand}
                handleReturn={this.handleReturn}
                blockRendererFn={this.blockRendererFn}
                handlePastedText={this.handlePastedText}
                handlePastedFiles={this.handlePastedFiles}
            />
        </div>);
    }
}

export default DraftEditor;
