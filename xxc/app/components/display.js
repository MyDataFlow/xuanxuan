import React from 'react';
import ReactDOM from 'react-dom';
import DisplayContainer from './display-container';

const containerId = 'display-container';
let container = document.getElementById(containerId);
if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.classList.add('affix');
    document.body.appendChild(container);
}

let displayContainer = null;
ReactDOM.render(<DisplayContainer ref={e => {displayContainer = e;}} />, container);

/**
 * Show display layer with properties
 * @param {Object} props display layer properties
 * @param {?Function} callback
 */
const show = (props, callback) => (displayContainer && displayContainer.show(props, callback));

/**
 * Hide display layer by the given id
 * @param {String} id display layer id
 * @param {?Function} callback
 * @param {?Bool} remove
 */
const hide = (id, callback, remove) => (displayContainer && displayContainer.hide(id, callback, remove));

/**
 * Remove display layer by the given id
 * @param {String} id display layer id
 * @param {?Function} callback
 */
const remove = (id, callback) => (displayContainer && displayContainer.remove(id, callback));

/**
 * Get the display layer component refrence
 * @param {String} id display layer id
 */
const getRef = id => {
    const item = displayContainer && displayContainer.getItem(id);
    return item && item.ref;
};

/**
 * Set the display layer style
 * @param {String} id display layer id
 * @param {Object} id display layer style object
 * @param {?Function} callback
 */
const setStyle = (id, newStyle, callback) => (displayContainer && displayContainer.setStyle(id, newStyle, callback));

export default {
    show,
    hide,
    remove,
    getRef,
    setStyle,
};
