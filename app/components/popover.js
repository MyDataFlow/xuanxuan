import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import DisplayLayer from './display-layer';
import HTML from '../utils/html-helper';

const show = (position, content, props = {}, callback = null) => {
    let {
        className,
        arrow,
        arrowSize,
        width,
        height,
        style,
        offset,
    } = props;

    if(!position) {
        if(DEBUG) {
            throw new Error('Position is not defined to show the popover.');
        }
    }

    if(!props.id) {
        props.id = timeSequence();
    }

    if(arrow === undefined) {
        arrow = true;
    }

    if(arrow) {
        if(!arrowSize) {
            arrowSize = {width: 20, height: 10};
        } else if(typeof arrowSize === 'number') {
            arrowSize = {width: arrowSize, height: arrowSize/2};
        }
    } else {
        arrowSize = {width: 0, height: 0};
    }

    width = width || 200;
    height = height || 100;
    const windowHeight = window.innerHeight,
          windowWidth = window.innerWidth,
          target = position.target;
    let x = position.x === undefined ? (position.pageX || 0) : position.x,
        y = position.y === undefined ? (position.pageY || 0) : position.y,
        placement = position.placement || 'auto',
        align = position.align || 'center';
    if(placement === 'auto') {
        const sideSize = [
            {name: 'top', size: y},
            {name: 'right', size: windowWidth - x},
            {name: 'bottom', size: windowHeight - y},
            {name: 'left', size: x}
        ];
        let maxSize = 0, bestSide = 'top';
        for(let side of sideSize) {
            if(maxSize < side.size) {
                maxSize = side.size;
                bestSide = side.name;
            }
        }
        placement = bestSide;
    }
    if(target && target.getBoundingClientRect) {
        const bounds = target.getBoundingClientRect();
        switch(placement) {
            case 'top':
                x = bounds.left + Math.floor(bounds.width/2);
                y = bounds.top;
                break;
            case 'right':
                x = bounds.left + bounds.width;
                y = bounds.top + Math.floor(bounds.height/2);
                break;
            case 'bottom':
                x = bounds.left + Math.floor(bounds.width/2);
                y = bounds.top + bounds.height;
                break;
            case 'left':
                x = bounds.left;
                y = bounds.top + Math.floor(bounds.height/2);
                break;
        }
    }
    let left = 0, top = 0, arrowStyle = {};
    switch(placement) {
        case 'top':
            top = Math.max(0, Math.min(windowHeight - height, y - height - arrowSize.height));
            if(align === 'start') {
                left = Math.floor(Math.max(0, Math.min(windowWidth - width, x - arrow.width/2)));
            } else if(align === 'end') {
                left = Math.floor(Math.max(0, Math.min(windowWidth - width, x - width + arrow.width/2)));
            } else {
                left = Math.floor(Math.max(0, Math.min(windowWidth - width, x - width/2)));
            }
            arrowStyle.left = Math.max(left + arrowSize.width/2, Math.min(left + width - arrowSize.width/2, x));
            break;
        case 'right':
            left = Math.floor(Math.max(0, Math.min(windowWidth - width, x + arrowSize.height)));
            if(align === 'start') {
                top = Math.max(0, Math.min(windowHeight - height, y - arrow.width/2));
            } else if(align === 'end') {
                top = Math.max(0, Math.min(windowHeight - height, y - height + arrow.width/2));
            } else {
                top = Math.max(0, Math.min(windowHeight - height, y - height/2));
            }
            arrowStyle.top = Math.max(top + arrowSize.height/2, Math.min(top + height - arrowSize.height/2, y));
            break;
        case 'bottom':
            top = Math.max(0, Math.min(windowHeight - height, y + arrowSize.height));
            if(align === 'start') {
                left = Math.floor(Math.max(0, Math.min(windowWidth - width, x - arrow.width/2)));
            } else if(align === 'end') {
                left = Math.floor(Math.max(0, Math.min(windowWidth - width, x - width + arrow.width/2)));
            } else {
                left = Math.floor(Math.max(0, Math.min(windowWidth - width, x - width/2)));
            }
            arrowStyle.left = Math.max(left + arrowSize.width/2, Math.min(left + width - arrowSize.width/2, x));
            break;
        case 'left':
            left = Math.floor(Math.max(0, Math.min(windowWidth - width, x - width - arrowSize.height)));
            if(align === 'start') {
                top = Math.max(0, Math.min(windowHeight - height, y - arrow.width/2));
            } else if(align === 'end') {
                top = Math.max(0, Math.min(windowHeight - height, y - height + arrow.width/2));
            } else {
                top = Math.max(0, Math.min(windowHeight - height, y - height/2));
            }
            arrowStyle.top = Math.max(top + arrowSize.height/2, Math.min(top + height - arrowSize.height/2, y));
            break;
    }
    if(offset) {
        if(offset.left) left += offset.left;
        if(offset.top) top += offset.top;
    }

    style = Object.assign({width, height, top, left}, style);

    className = HTML.classes('popover layer', className, `placement-${placement}`);
    const arrowPlacementMap = {left: 'right', right: 'left', top: 'bottom', bottom: 'top'};
    const footer = arrow ? <div style={arrowStyle} className={`display-arrow arrow-${arrowPlacementMap[placement]}`}></div> : null;
    props = Object.assign({backdropClassName: 'clean', animation: `scale-from-${arrowPlacementMap[placement]}`}, props, {className, style, content, footer, plugName: 'popover'});
    delete props.width;
    delete props.height;
    delete props.arrow;
    delete props.arrowSize;
    delete props.offset;

    return DisplayLayer.show(props, callback);
};

export default {
    show,
    hide: DisplayLayer.hide,
    remove: DisplayLayer.remove
};
