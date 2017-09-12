import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import DisplayLayer from './display-layer';
import HTML from '../utils/html-helper';
import Icon from './icon';
import timeSequence from '../utils/time-sequence';
import Lang from '../lang';
import InputControl from './input-control';

const isWindowsOS = window.navigator.userAgent.includes('Windows');

const DEFAULT_CLASS_NAMES = {
    'submit': 'primary',
    'primary': 'primary',
    'secondary': 'text-red red-pale',
    'cancel': 'primary-pale text-primary'
};

const show = (props, callback) => {
    let {
        title,
        closeButton,
        actions,
        onAction,
        className,
    } = props;

    if(closeButton === undefined) {
        closeButton = true;
    }

    if(!props.id) {
        props.id = timeSequence();
    }

    className = HTML.classes('modal layer', className || 'rounded');

    if(actions === undefined) {
        actions = true;
    }
    if(actions === true) {
        actions = [{type: 'submit'}, {type: 'cancel'}]
    }
    let footer = null;
    if(actions && actions.length) {
        actions = actions.map((act, idx) => {
            if(!act.order) {
                act.order = idx;
                switch(act.type) {
                    case 'submit':
                        act.order += isWindowsOS ? (-9000) : 9000;
                        break;
                    case 'primary':
                        act.order += isWindowsOS ? (-8000) : 8000;
                        break;
                    case 'secondary':
                        act.order += isWindowsOS ? (-7000) : 7000;
                        break;
                    case 'cancel':
                        act.order += isWindowsOS ? (9000) : -9000;
                        break;
                }
            }
            if(act.type && !act.className) {
                act.className = DEFAULT_CLASS_NAMES[act.type];
            }
            if(!act.label && act.type) {
                act.label = act.type === 'submit' ? Lang.string('common.confirm') : act.type === 'cancel' ? Lang.string('common.cancel') : act.type.toUpperCase();
            }
            return act;
        });

        actions = actions.sort((act1, act2) => {
            return act1.order - act2.order;
        });

        const handleActionClick = (action, e) => {
            let actionResult = null;
            if(onAction) {
                actionResult = onAction(action, e);
            }
            if(action.click) {
                actionResult = action.click(action, e);
            }
            if(actionResult !== false) {
                DisplayLayer.hide(props.id);
            }
        };

        footer = <footer className="footer toolbar">
        {
            actions.map((action, actionIndex) => {
                return <button className={HTML.classes('btn', action.className, action.type ? `action-${action.type}` : null)} type="button" onClick={handleActionClick.bind(null, action)} key={actionIndex} title={action.label}>{action.label}</button>
            })
        }
        </footer>;
    }

    const header = (title || closeButton) ? <header className="heading">
        <div className="title">{title}</div>
        {closeButton && <nav className="nav"><a className="close" onClick={() => {
            DisplayLayer.remove(props.id);
        }}><Icon name="close"/></a></nav>}
    </header> : null;

    props = Object.assign({}, props, {className, header, footer, closeButton, plugName: 'modal'});
    delete props.title;
    delete props.closeButton;
    delete props.actions;
    delete props.onAction;

    return DisplayLayer.show(props, callback);
};

const alert = (content, props, callback) => {
    return show(Object.assign({
        modal: true,
        content: content
    }, props), callback);
};

const confirm = (content, props, callback) => {
    return new Promise(resolve => {
        let resolved = false;
        show(Object.assign({
            closeButton: false,
            modal: true,
            content: content,
            actions: true,
            onAction: action => {
                if(!resolved) {
                    resolve(action.type === 'submit');
                }
            },
            onHidden: () => {
                if(!resolved) {
                    resolve(false);
                }
            }
        }, props), callback)
    });
};

const prompt = (title, defaultValue, props, callback) => {
    return new Promise(resolve => {
        let resolved = false;
        let value = defaultValue;
        show(Object.assign({
            closeButton: false,
            modal: true,
            header: title,
            content: <InputControl defaultValue={defaultValue} onChange={newValue => {
                value = newValue;
            }}/>,
            actions: true,
            onAction: action => {
                if(!resolved) {
                    resolve(value, value !== defaultValue);
                }
            },
            onHidden: () => {
                if(!resolved) {
                    resolve(value, false);
                }
            }
        }, props), callback)
    });
};

export default {
    show,
    alert,
    confirm,
    prompt,
    hide: DisplayLayer.hide,
    remove: DisplayLayer.remove
};
