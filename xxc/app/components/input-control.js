import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import hotkeys from 'hotkeys-js';
import {classes} from '../utils/html-helper';
import timeSequence from '../utils/time-sequence';

hotkeys.filter = event => {
    const target = (event.target || event.srcElement);
    const tagName = target.tagName;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tagName)) {
        const scopeAttr = target.attributes['data-hotkey-scope'];
        const scope = scopeAttr && scopeAttr.value;
        if (scope) {
            hotkeys.setScope(scope);
            return true;
        }
        return false;
    }
    return true;
};

class InputControl extends PureComponent {
    static propTypes = {
        value: PropTypes.string,
        defaultValue: PropTypes.string,
        label: PropTypes.any,
        className: PropTypes.string,
        placeholder: PropTypes.string,
        autoFocus: PropTypes.bool,
        style: PropTypes.object,
        labelStyle: PropTypes.object,
        inputType: PropTypes.string.isRequired,
        inputStyle: PropTypes.object,
        inputProps: PropTypes.object,
        helpText: PropTypes.string,
        onChange: PropTypes.func,
        disabled: PropTypes.bool,
        inputClassName: PropTypes.string,
        children: PropTypes.any,
        name: PropTypes.string,
        hotkeyScope: PropTypes.string,
        hotKeys: PropTypes.object,
    };

    static defaultProps = {
        label: ' ',
        className: '',
        placeholder: '',
        autoFocus: false,
        style: null,
        inputType: 'text',
        value: '',
        helpText: null,
        onChange: null,
        disabled: false,
        inputClassName: 'rounded',
        name: '',
        labelStyle: null,
        inputStyle: null,
        inputProps: null,
        children: null,
        defaultValue: undefined,
        hotkeyScope: null,
        hotKeys: null
    };

    constructor(props) {
        super(props);
        const {defaultValue, name, hotkeyScope, hotKeys} = props;
        this.controled = defaultValue === undefined;
        this.controlName = name || `inputControl-${timeSequence()}`;
        this.hotkeyScope = (hotkeyScope || hotKeys) ? (hotkeyScope || this.controlName) : '';
    }

    componentDidMount() {
        const {autoFocus, hotKeys} = this.props;

        if (autoFocus) {
            this.autoFocusTask = setTimeout(() => {
                this.focus();
                this.autoFocusTask = null;
            }, 100);
        }

        if (hotKeys) {
            Object.keys(hotkeys).forEach(key => {
                hotkeys(key, this.hotkeysScope, hotkeys[key]);
            });
        }
    }

    componentWillUnmount() {
        if (this.autoFocusTask) {
            clearTimeout(this.autoFocusTask);
            this.autoFocusTask = null;
        }

        if (this.hotkeyScope) {
            hotkeys.deleteScope(this.hotkeysScope);
        }
    }

    handleChange = (event) => {
        const value = this.input.value;
        if (this.props.onChange) {
            this.props.onChange(value, event);
        }
    }

    get value() {
        return this.input.value;
    }

    focus() {
        this.input.focus();
    }

    render() {
        const {
            name,
            label,
            labelStyle,
            placeholder,
            autoFocus,
            inputType,
            inputStyle,
            inputProps,
            value,
            helpText,
            onChange,
            className,
            inputClassName,
            defaultValue,
            disabled,
            children,
            hotkeyScope,
            hotKeys,
            ...other
        } = this.props;

        return (<div className={classes('control', className, {disabled})} {...other}>
            {label !== false && <label htmlFor={this.controlName} style={labelStyle}>{label}</label>}
            <input
                data-hotkey-scope={this.hotkeyScope}
                disabled={!!disabled}
                ref={e => {this.input = e;}}
                value={this.controled ? value : undefined}
                defaultValue={defaultValue}
                id={this.controlName}
                type={inputType}
                className={classes('input', inputClassName)}
                placeholder={placeholder}
                onChange={this.handleChange}
                style={inputStyle}
                {...inputProps}
            />
            {helpText ? <p className="help-text">{helpText}</p> : null}
            {children}
        </div>);
    }
}

export default InputControl;
