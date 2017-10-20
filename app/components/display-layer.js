import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Icon from './icon';
import Lang from '../lang';
import Spinner from './spinner';
import HTML from '../utils/html-helper';
import timeSequence from '../utils/time-sequence';
import Status from '../utils/status';

const STAGE = new Status({
    init: 0,
    ready: 1,
    shown: 2,
    hidden: 3
}, 0);

let zIndexSeed = 1100;

class DisplayLayer extends Component {

    static STAGE = STAGE;

    static defaultProps = {
        plugName: null,
        animation: 'scale-from-top',
        modal: false, // if modal set true, user cannot close layer by click backdrop(if backdrop set true too)
        show: true,   // Show on ready
        content: '',  // Content can be a function and return a promise to load lazy content
        contentClassName: '',
        header: null,
        footer: null,
        onShown: null,
        onHidden: null,
        hotkey: true,
        className: 'layer',
        rootClassName: '',
        backdrop: true,
        backdropClassName: '',
        loadingContent: true,
        cache: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            stage: STAGE.init,
            loading: true,
            content: null,
            style: null,
            zIndex: zIndexSeed++
        };
        if(typeof props.content !== 'function') {
            this.state.content = props.content;
            this.state.loading = false;
        }
        this.id = `display-${this.props.id || timeSequence()}`;
    }

    get stageName() {
        return STAGE.getName(this.state.stage);
    }

    get isShow() {
        return this.isStage(STAGE.shown);
    }

    get isHide() {
        return this.isStage(STAGE.hidden);
    }

    isStage(stage) {
        return STAGE.isSame(stage, this.state.stage);
    }

    changeStage(stage) {
        const newState = {stage: STAGE.getValue(stage)};
        if(STAGE.isSame(stage, STAGE.shown)) {
            newState.zIndex = zIndexSeed++;
        }
        this.setState(newState);
    }

    setStyle(style, callback) {
        this.setState({style}, callback);
    }

    show(callback) {
        if(this.state.stage === STAGE.init) {
            this.changeStage(STAGE.ready);
            this.showTimerTask = setTimeout(() => {
                this.show(callback);
            }, 50);
        } else {
            this.changeStage(STAGE.shown);
            if(this.props.animation) {
                setTimeout(() => {
                    this.props.onShown && this.props.onShown(this);
                    callback && callback(this);
                }, 400);
            } else {
                this.props.onShown && this.props.onShown(this);
                callback && callback(this);
            }
        }
    }

    hide(callback) {
        this.changeStage(STAGE.hidden);
        if(this.props.animation) {
            setTimeout(() => {
                if(this.props.cache) {
                    this.reset();
                }
                this.props.onHidden && this.props.onHidden(this);
                callback && callback(this);
            }, 400);
        } else {
            if(this.props.cache) {
                this.reset();
            }
            this.props.onHidden && this.props.onHidden(this);
            callback && callback(this);
        }
    }

    loadContent(newContent, callback) {
        let {content, contentLoadFail, onLoad} = this.props;
        if(newContent !== undefined) {
            content = newContent;
        }
        if(typeof content === 'function') {
            const contentResult = content();
            if(contentResult instanceof Promise) {
                this.setState({loading: true, content: null});
                contentResult.then(result => {
                    this.setState({content: result, loading: false}, () => {
                        onLoad && onLoad(true, this.state.content, this);
                        callback && callback(true, this.state.content, this);
                    });
                }).catch(() => {
                    this.setState({content: contentLoadFail, loading: false}, () => {
                        onLoad && onLoad(false, this.state.content, this);
                        callback && callback(false, this.state.content, this);
                    });
                });
            } else {
                this.setState({content: contentResult, loading: false}, () => {
                    onLoad && onLoad(true, contentResult, this);
                    callback && callback(true, contentResult, this);
                });
            }
        }
    }

    handeWindowKeyup(e) {
        const {hotkey} = this.props;
        if (e.keyCode === 27 && !this.props.modal) { // ESC key code: 27
            this.hide();
        } else if(typeof hotkey === 'function') {
            hotkey(e, this);
        }
    }

    componentWillUnmount() {
        if(this.props.hotkey) {
            window.removeEventListener('keyup', this.handleWindowKeyup);
        }
        clearTimeout(this.showTimerTask);
    }

    componentDidMount() {
        if(this.props.show) {
            this.show();
            this.loadContent();
        }

        if(this.props.hotkey) {
            window.addEventListener('keyup', this.handleWindowKeyup);
        }
    }

    reset() {
        this.setState({stage: STAGE.init});
    }

    handleBackdropClick = () => {
        if(!this.props.modal) {
            this.hide();
        }
    }

    render() {
        let {
            plugName,
            className,
            rootClassName,
            backdrop,
            backdropClassName,
            animation,
            modal,
            show,    // Show after mounted
            content, // Content can be a function and return a promise to load lazy content
            onShown,
            onHidden,
            header,
            footer,
            hotkey,
            cache,
            loadingContent,
            contentClassName,
            children,
            style,
            ...other
        } = this.props;

        if(loadingContent === true) {
            loadingContent = <Spinner/>;
        }

        rootClassName = HTML.classes(
            'display-layer',
            rootClassName,
            `display-stage-${this.stageName}`,
            plugName ? `display-layer-${plugName}` : null,
            {'has-animation': animation}
        );

        return <div onKeyUp={this.handeWindowKeyup.bind(this)} className={rootClassName} style={{zIndex: this.state.zIndex}}>
            {backdrop && <div onClick={this.handleBackdropClick} className={HTML.classes('display-backdrop', backdropClassName)}></div>}
            <div className={HTML.classes('display', animation, className, {in: this.isStage(STAGE.shown)})} {...other} style={Object.assign({}, style, this.state.style)} ref={e => this.displayElement = e}>
                {header}
                <div className={HTML.classes('content', contentClassName)}>{this.state.loading ? loadingContent : this.state.content}</div>
                {children}
                {footer}
            </div>
        </div>;
    }
}

class DisplayContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            all: {}
        };
    }

    getItem(id) {
        return this.state.all[id];
    }

    show(props, callback) {
        const all = this.state.all;
        if(typeof props !== 'object') {
            props = {id: props};
        }
        if(!props.id) {
            props.id = timeSequence();
        }
        const {id} = props;
        const item = all[id];
        if(!item) {
            if(!props.cache) {
                let userOnHidden = props.onHidden;
                props.onHidden = (ref) => {
                    userOnHidden && userOnHidden(ref);
                    delete all[id];
                    this.setState({all});
                };
            }
            let userOnShow = props.onShown;
            props.onShown = (ref) => {
                userOnShow && userOnShow(ref);
                callback && callback(ref);
            };
            all[id] = {props};
            this.setState({all});
        } else {
            item.ref.show(callback);
            return item.ref;
        }
    }

    hide(id, callback, remove = 'auto') {
        const all = this.state.all;
        const item = all[id];
        if(!item) {
            if(DEBUG) {
                console.warn(`Cannot find display layer with id ${id}.`);
            }
            callback && callback(false);
            return;
        }
        if(remove === 'auto') {
            remove = !item.props.cache;
        }
        item.ref.hide(() => {
            if(remove) {
                delete all[id];
                this.setState({all});
            }
            callback && callback();
        });
        return item.ref;
    }

    remove(id, callback) {
        return hide(id, callback, true);
    }

    load(id, newContent, callback) {
        const all = this.state.all;
        const item = all[id];
        if(!item) {
            if(DEBUG) {
                console.error(`Cannot find display layer with id ${id}.`);
            }
            return;
        }
        item.ref.loadContent(newContent, callback);
        return item.ref;
    }

    setStyle(id, newStyle, callback) {
        const all = this.state.all;
        const item = all[id];
        if(!item) {
            if(DEBUG) {
                console.error(`Cannot find display layer with id ${id}.`);
            }
            return;
        }
        item.ref.setStyle(newStyle, callback);
        return item.ref;
    }

    render() {
        return (<div className="display-container dock">
        {
            Object.keys(this.state.all).map(itemId => {
                const item = this.state.all[itemId];
                const props = item.props;
                return <DisplayLayer key={itemId} ref={e => {item.ref = e;}} {...props} />;
            })
        }
        </div>);
    }
}

const containerId = 'display-container';
let container = document.getElementById(containerId);
if(!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.classList.add('affix');
    document.body.appendChild(container);
}

let displayContainer = null;
ReactDOM.render(<DisplayContainer ref={e => displayContainer = e}/>, container);

export {DisplayContainer, DisplayLayer};
export default {
    show(props, callback) {
        return displayContainer && displayContainer.show(props, callback);
    },

    hide(id, callback, remove) {
        return displayContainer && displayContainer.hide(id, callback, remove);
    },

    remove(id, callback) {
        return displayContainer && displayContainer.hide(id, callback);
    },

    getRef(id) {
        const item = displayContainer && displayContainer.getItem(id);
        return item && item.ref;
    },

    setStyle(id, newStyle, callback) {
        return displayContainer && displayContainer.setStyle(id, newStyle, callback);
    }
};
