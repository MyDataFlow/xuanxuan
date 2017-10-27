import React from 'react';
import Display from './display';
import HTML from '../utils/html-helper';
import Icon from './icon';
import timeSequence from '../utils/time-sequence';

const show = (message, props = {}, callback = null) => {
    let {
        icon,
        type,
        content,
        autoHide,
        closeButton,
        actions,
        onAction,
        className,
        rootClassName,
        position,
    } = props;

    if (!props.id) {
        props.id = timeSequence();
    }

    if (closeButton === undefined) {
        closeButton = true;
    }

    if (position === undefined) {
        position = 'top';
    }

    if (!type) {
        type = 'info';
    }
    rootClassName = HTML.classes(rootClassName, `position-${position}`);
    className = HTML.classes('messager layer', className || 'rounded', type);

    content = (content || icon) ? (<div className="row single flex-middle">
        {icon ? (typeof icon === 'string' ? <Icon className="flex-auto messager-icon" name={icon} /> : <div className="flex-none messager-icon">{icon}</div>) : null}
        {content ? <div className="flex-auto messager-content">
            <h5 className="messager-title">{message}</h5>
            <div>{content}</div>
        </div> : <div className="flex-auto messager-content">{message}</div>}
    </div>) : message;

    if (!actions) {
        actions = [];
    }
    if (closeButton) {
        actions.push({
            icon: 'close',
            click: () => {
                Display.hide(props.id);
            }
        });
    }
    let footer = null;
    if (actions && actions.length) {
        const handleActionClick = (action, e) => {
            let actionResult = null;
            if (onAction) {
                actionResult = onAction(action, e);
            }
            if (action.click) {
                actionResult = action.click(action, e);
            }
            if (actionResult !== false) {
                Display.hide(props.id);
            }
        };

        footer = (<nav className="nav">
            {
                actions.map((action, actionIndex) => {
                    return (<a onClick={handleActionClick.bind(null, action)} key={action.name || actionIndex} title={action.label}>{action.icon ? <Icon name={action.icon} /> : action.label}</a>);
                })
            }
        </nav>);
    }

    if (autoHide) {
        if (typeof autoHide !== 'number') {
            autoHide = 5000;
        }
        setTimeout(() => {
            Display.hide(props.id);
        }, autoHide);
    }

    props = Object.assign({backdropClassName: 'clean'}, props, {rootClassName, className, content, footer, closeButton, plugName: 'messager'});
    delete props.type;
    delete props.autoHide;
    delete props.closeButton;
    delete props.actions;
    delete props.position;
    delete props.onAction;

    return Display.show(props, callback);
};

export default {
    show,
    hide: Display.hide,
    remove: Display.remove
};
