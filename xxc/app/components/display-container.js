import React, {Component} from 'react';
import timeSequence from '../utils/time-sequence';
import DisplayLayer from './display-layer';

/**
 * Display container component
 *
 * @class DisplayContainer
 * @extends {Component}
 */
export default class DisplayContainer extends Component {
    /**
     * Creates an instance of DisplayContainer.
     * @param {Object} props
     * @memberof DisplayContainer
     */
    constructor(props) {
        super(props);
        this.state = {
            all: {}
        };
    }

    /**
     * Get display layer item by id
     *
     * @param {String} id the display layer id to get
     * @returns
     * @memberof DisplayContainer
     */
    getItem(id) {
        return this.state.all[id];
    }

    /**
     * Show display layer with props
     *
     * @param {Object} props
     * @param {?Function} callback
     * @returns
     * @memberof DisplayContainer
     */
    show(props, callback) {
        const all = this.state.all;
        if (typeof props !== 'object') {
            props = {id: props};
        }
        if (!props.id) {
            props.id = timeSequence();
        }
        const {id} = props;
        const item = all[id];
        if (!item) {
            if (!props.cache) {
                const userOnHidden = props.onHidden;
                props.onHidden = (ref) => {
                    if (userOnHidden) {
                        userOnHidden(ref);
                    }
                    delete all[id];
                    this.setState({all});
                };
            }
            const userOnShow = props.onShown;
            props.onShown = (ref) => {
                if (userOnShow) {
                    userOnShow(ref);
                }
                if (callback) {
                    callback(ref);
                }
            };
            all[id] = {props};
            this.setState({all});
        } else {
            const {style, cache} = props;
            if (cache && style) {
                item.ref.setStyle(style);
            }
            item.ref.show(callback);
            return item.ref;
        }
    }

    /**
     * Hide display layer
     *
     * @param {string} id display layer id to hide
     * @param {any} callback callback after hide
     * @param {string|Bool} [remove='auto']
     * @returns
     * @memberof DisplayContainer
     */
    hide(id, callback, remove = 'auto') {
        const all = this.state.all;
        const item = all[id];
        if (!item) {
            if (DEBUG) {
                console.warn(`Cannot find display layer with id ${id}.`);
            }
            if (callback) {
                callback(false);
            }
            return;
        }
        if (remove === 'auto') {
            remove = !item.props.cache;
        }
        item.ref.hide(() => {
            if (remove) {
                delete all[id];
                this.setState({all});
            }
            if (callback) {
                callback();
            }
        });
        return item.ref;
    }

    /**
     * Remove display layer
     *
     * @param {string} id display layer id to remove
     * @param {?Function} callback callback after remove
     * @returns
     * @memberof DisplayContainer
     */
    remove(id, callback) {
        return this.hide(id, callback, true);
    }

    /**
     * Load new content in display layer
     *
     * @param {string} id display layer id to load
     * @param {any} newContent new content
     * @param {?Function} callback callback after load
     * @returns
     * @memberof DisplayContainer
     */
    load(id, newContent, callback) {
        const all = this.state.all;
        const item = all[id];
        if (!item) {
            if (DEBUG) {
                console.error(`Cannot find display layer with id ${id}.`);
            }
            return;
        }
        item.ref.loadContent(newContent, callback);
        return item.ref;
    }

    /**
     * Set display layer element style
     *
     * @param {string} id display layer id to set style
     * @param {object} newStyle new style object
     * @param {?Function} callback callback after set style
     * @returns
     * @memberof DisplayContainer
     */
    setStyle(id, newStyle, callback) {
        const all = this.state.all;
        const item = all[id];
        if (!item) {
            if (DEBUG) {
                console.error(`Cannot find display layer with id ${id}.`);
            }
            return;
        }
        item.ref.setStyle(newStyle, callback);
        return item.ref;
    }

    /**
     * React life cycle: render
     *
     * @returns
     * @memberof DisplayContainer
     */
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
