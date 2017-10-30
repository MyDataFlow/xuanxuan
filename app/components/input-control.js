import React, {Component, PropTypes} from 'react';
import HTML from '../utils/html-helper';
import timeSequence from '../utils/time-sequence';

class InputControl extends Component {
    static defaultProps = {
        label: ' ',
        className: '',
        placeholder: '',
        autoFocus: false,
        style: null,
        inputType: 'text',
        defaultValue: '',
        helpText: null,
        onChange: null,
        disabled: false,
        inputClassName: 'rounded',
        name: `control${timeSequence()}`,
        labelStyle: null,
        inputStyle: null,
        inputProps: null,
        children: null,
    };

    static propTypes = {
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
    }

    constructor(props) {
        super(props);
        this.state = {value: this.props.defaultValue};
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        if (this.props.autoFocus) {
            this.autoFocusTask = setTimeout(() => {
                this.focus();
                this.autoFocusTask = null;
            }, 100);
        }
    }

    componentWillUnmount() {
        if (this.autoFocusTask) {
            clearTimeout(this.autoFocusTask);
            this.autoFocusTask = null;
        }
    }

    handleChange(event) {
        const value = this.input.value;
        if (this.state.value !== value) {
            this.setState({value});
            if (this.props.onChange) {
                this.props.onChange(value, event);
            }
        }
    }

    focus() {
        this.input.focus();
    }

    setValue(value = '') {
        this.input.value = value;
        this.handleChange();
    }

    render() {
        let {
            name,
            label,
            labelStyle,
            placeholder,
            autoFocus,
            inputType,
            inputStyle,
            inputProps,
            defaultValue,
            helpText,
            onChange,
            className,
            inputClassName,
            disabled,
            children,
            ...other
        } = this.props;

        return (<div className={HTML.classes('control', className, {disabled})} {...other}>
            {label !== false && <label htmlFor={name} style={labelStyle}>{label}</label>}
            <input
                disabled={!!disabled}
                ref={e => {this.input = e;}}
                value={this.state.value}
                id={name}
                type={inputType}
                className={HTML.classes('input', inputClassName)}
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
