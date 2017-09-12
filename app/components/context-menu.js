import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import DisplayLayer from './display-layer';
import HTML from '../utils/html-helper';
import Icon from './icon';

const show = (position, menus, props = {}, callback = null) => {
    let {
        className,
        onItemClick,
        menuClassName,
        itemClassName,
        content,
        style,
    } = props;

    if(!position) {
        if(DEBUG) {
            throw new Error('Position is not defined to show the popover.');
        }
    }

    if(!props.id) {
        props.id = timeSequence();
    }

    const handleItemClick = (item, e) => {
        let clickResult = null;
        if(onItemClick) {
            clickResult = onItemClick(item, e);
        }
        if(item.click) {
            clickResult = item.click(item, e);
        }
        if(clickResult !== false) {
            DisplayLayer.remove(props.id);
        }
    };
    content = <div className={HTML.classes("list dropdown-menu", menuClassName)}>
        {
            menus.map((item, idx) => {
                let {
                    id,
                    className,
                    click,
                    render,
                    ...other
                } = item;
                if(render) {
                    return render(item);
                } else if(item.type === 'divider') {
                    return <div key={id || idx} className={HTML.classes('divider', className)} {...other}></div>;
                } else {
                    return <a onClick={handleItemClick.bind(null, item)} key={id || idx} className={HTML.classes('item', itemClassName, className)} {...other}>
                        {item.icon && <Icon name={item.icon}/>}
                        {item.label && <span className="title">{item.label}</span>}
                        {item.checked && <Icon name="checked"/>}
                    </a>;
                }
            })
        }
        {content}
    </div>;

    const x = position.x || 0;
    const y = position.y || 0;
    style = Object.assign({maxWidth: window.innerWidth, maxHeight: window.innerHeight, left: x, top: y}, style);

    className = HTML.classes('contextmenu layer', className, `placement-${placement}`);

    props = Object.assign({backdropClassName: 'transparent'}, props, {className, style, content, plugName: 'contextmenu'});
    delete props.menuClassName;
    delete props.itemClassName;
    delete props.onItemClick;

    return DisplayLayer.show(props, display => {
        const ele = display.displayElement;
        const newX = Math.max(0, Math.min(window.innerWidth - ele.clientWidth, x));
        const newY = Math.max(0, Math.min(window.innerHeight - ele.clientHeight, y));
        if(newX !== x || newY !== y) {
            display.setStyle({top: y, left: x});
        }
    });
};

export default {
    show,
    hide: DisplayLayer.hide,
    remove: DisplayLayer.remove
};
