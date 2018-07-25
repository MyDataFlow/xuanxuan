import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Spinner from './spinner';
import {classes} from '../utils/html-helper';
import timeSequence from '../utils/time-sequence';
import Status from '../utils/status';

/**
 * Display layer stages
 */
const STAGE = new Status({
    init: 0,
    ready: 1,
    shown: 2,
    hidden: 3
}, 0);

let zIndexSeed = 1100;
const newZIndex = () => {
    zIndexSeed += 1;
    return zIndexSeed;
};

export default class DisplayLayer extends PureComponent {
    /**
     * State types
     *
     * @static
     * @memberof DisplayLayer
     */
    static STAGE = STAGE;

    static propTypes = {
        content: PropTypes.any,
        contentLoadFail: PropTypes.any,
        id: PropTypes.any,
        animation: PropTypes.any,
        onShown: PropTypes.func,
        onHidden: PropTypes.func,
        onLoad: PropTypes.func,
        show: PropTypes.bool,
        hotkey: PropTypes.bool,
        cache: PropTypes.bool,
        loadingContent: PropTypes.bool,
        rootClassName: PropTypes.string,
        className: PropTypes.string,
        backdrop: PropTypes.bool,
        backdropClassName: PropTypes.string,
        contentClassName: PropTypes.string,
        footer: PropTypes.any,
        header: PropTypes.any,
        plugName: PropTypes.string,
        modal: PropTypes.bool,
        children: PropTypes.any,
        style: PropTypes.object,
    };

    /**
     * Default properties values
     *
     * @static
     * @memberof DisplayLayer
     */
    static defaultProps = {
        plugName: null,
        animation: 'scale-from-top',
        // if modal set true, user cannot close layer by click backdrop(if backdrop set true too)
        modal: false,
        // Show on ready
        show: true,
        // Content can be a function and return a promise to load lazy content
        content: '',
        contentLoadFail: null,
        contentClassName: '',
        header: null,
        footer: null,
        onShown: null,
        onHidden: null,
        onLoad: null,
        hotkey: true,
        className: 'layer',
        rootClassName: '',
        backdrop: true,
        backdropClassName: '',
        loadingContent: true,
        cache: false,
        id: null,
        children: null,
        style: null,
    };

    /**
     * Creates an instance of DisplayLayer.
     * @param {Object} props
     * @memberof DisplayLayer
     */
    constructor(props) {
        super(props);
        this.state = {
            stage: STAGE.init,
            loading: true,
            content: null,
            style: null,
            zIndex: newZIndex()
        };
        if (typeof props.content !== 'function') {
            this.state.content = props.content;
            this.state.loading = false;
        }
        this.id = this.props.id || `display-${timeSequence()}`;
    }

    /**
     * React life cycle: componentDidMount
     *
     * @private
     * @memberof DisplayLayer
     */
    componentDidMount() {
        if (this.props.show) {
            this.show();
            this.loadContent();
        }

        if (this.props.hotkey) {
            window.addEventListener('keyup', this.handleWindowKeyup);
        }
    }

    /**
     * React life cycle: componentWillUnmount
     *
     * @private
     * @memberof DisplayLayer
     */
    componentWillUnmount() {
        if (this.props.hotkey) {
            window.removeEventListener('keyup', this.handleWindowKeyup);
        }
        clearTimeout(this.showTimerTask);
    }

    /**
     * Get stage name
     *
     * @readonly
     * @memberof DisplayLayer
     */
    get stageName() {
        return STAGE.getName(this.state.stage);
    }

    /**
     * Check whether the layer is show
     *
     * @readonly
     * @memberof DisplayLayer
     */
    get isShow() {
        return this.isStage(STAGE.shown);
    }

    /**
     * Check whether the layer is hide
     *
     * @readonly
     * @memberof DisplayLayer
     */
    get isHide() {
        return this.isStage(STAGE.hidden);
    }

    /**
     * Check whether the stage is the given one
     *
     * @param {String|Number} stage
     * @returns
     * @memberof DisplayLayer
     */
    isStage(stage) {
        return STAGE.isSame(stage, this.state.stage);
    }

    /**
     * Change state to the given one
     *
     * @param {String|Number} stage
     * @memberof DisplayLayer
     */
    changeStage(stage) {
        const newState = {stage: STAGE.getValue(stage)};
        if (STAGE.isSame(stage, STAGE.shown)) {
            newState.zIndex = newZIndex();
        }
        this.setState(newState);
    }

    /**
     * Set display layer element style
     *
     * @param {Object} style
     * @param {?Function} callback
     * @memberof DisplayLayer
     */
    setStyle(style, callback) {
        this.setState({style}, callback);
    }

    /**
     * Show the layer
     *
     * @param {?Function} callback
     * @memberof DisplayLayer
     */
    show(callback) {
        if (this.state.stage === STAGE.init) {
            this.changeStage(STAGE.ready);
            this.showTimerTask = setTimeout(() => {
                this.show(callback);
            }, 50);
        } else {
            this.changeStage(STAGE.shown);
            const afterShow = () => {
                if (this.props.onShown) {
                    this.props.onShown(this);
                }
                if (callback) {
                    callback(this);
                }
            };
            if (this.props.animation) {
                setTimeout(afterShow, 400);
            } else {
                afterShow();
            }
        }
    }

    /**
     * Hide the layer
     *
     * @param {?Function} callback
     * @memberof DisplayLayer
     */
    hide(callback) {
        this.changeStage(STAGE.hidden);
        const afterHidden = () => {
            if (this.props.cache) {
                this.reset();
            }
            if (this.props.onHidden) {
                this.props.onHidden(this);
            }
            if (callback) {
                callback(this);
            }
        };
        if (this.props.animation) {
            setTimeout(afterHidden, 400);
        } else {
            afterHidden();
        }
    }

    /**
     * Load new content for the layer
     *
     * @param {any} newContent
     * @param {?Function} callback
     * @memberof DisplayLayer
     */
    loadContent(newContent, callback) {
        let {content, contentLoadFail, onLoad} = this.props;
        if (newContent !== undefined) {
            content = newContent;
        }
        if (typeof content === 'function') {
            const contentResult = content();
            const afterLoad = () => {
                if (onLoad) {
                    onLoad(true, this.state.content, this);
                }
                if (callback) {
                    callback(true, this.state.content, this);
                }
            };
            if (contentResult instanceof Promise) {
                this.setState({loading: true, content: null});
                contentResult.then(result => {
                    this.setState({content: result, loading: false}, afterLoad);
                }).catch(() => {
                    this.setState({content: contentLoadFail, loading: false}, afterLoad);
                });
            } else {
                this.setState({content: contentResult, loading: false}, afterLoad);
            }
        }
    }

    /**
     * Handle window key up event
     *
     * @private
     * @param {any} e
     * @memberof DisplayLayer
     */
    handeWindowKeyup(e) {
        const {hotkey} = this.props;
        if (e.keyCode === 27 && !this.props.modal) { // ESC key code: 27
            this.hide();
        } else if (typeof hotkey === 'function') {
            hotkey(e, this);
        }
    }

    /**
     * Reset the state to init
     *
     * @memberof DisplayLayer
     */
    reset() {
        this.setState({stage: STAGE.init});
    }

    /**
     * Handle backdrop click event
     *
     * @private
     * @memberof DisplayLayer
     */
    handleBackdropClick = () => {
        if (!this.props.modal) {
            this.hide();
        }
    }

    /**
     * React life cycle: render
     *
     * @returns
     * @memberof DisplayLayer
     */
    render() {
        let {
            plugName,
            className,
            rootClassName,
            backdrop,
            backdropClassName,
            animation,
            modal,
            show,
            content,
            onShown,
            onHidden,
            header,
            footer,
            hotkey,
            cache,
            loadingContent,
            contentClassName,
            contentLoadFail,
            children,
            style,
            id,
            ...other
        } = this.props;

        if (loadingContent === true) {
            loadingContent = <Spinner />;
        }

        rootClassName = classes(
            'display-layer',
            rootClassName,
            `display-stage-${this.stageName}`,
            plugName ? `display-layer-${plugName}` : null,
            {'has-animation': animation}
        );

        return (<div onKeyUp={this.handeWindowKeyup.bind(this)} className={rootClassName} style={{zIndex: this.state.zIndex}}>
            {backdrop && <div onClick={this.handleBackdropClick} className={classes('display-backdrop', backdropClassName)} />}
            <div id={this.id} className={classes('display', animation, className, {in: this.isStage(STAGE.shown)})} {...other} style={Object.assign({}, style, this.state.style)} ref={e => {this.displayElement = e;}}>
                {header}
                <div className={classes('content', contentClassName)}>{this.state.loading ? loadingContent : this.state.content}</div>
                {children}
                {footer}
            </div>
        </div>);
    }
}
