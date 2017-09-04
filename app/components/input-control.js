import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../utils/html-helper';
import timeSequence from '../utils/time-sequence';

class InputControl extends Component {

    static defaultProps = {
        label: '',
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
    };

    constructor(props) {
        super(props);
        this.state = {value: this.props.defaultValue};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        const value = this.input.value;
        if(this.state.value !== value) {
            this.setState({value: value});
            this.props.onChange && this.props.onChange(value, event);
        }
    }

    componentDidMount() {
        if(this.props.autoFocus) {
            this.autoFocusTask = setTimeout(() => {
                this.focus();
                this.autoFocusTask = null;
            }, 100);
        }
    }

    componentWillUnmount() {
        if(this.autoFocusTask) {
            clearTimeout(this.autoFocusTask);
            this.autoFocusTask = null;
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
            placeholder,
            autoFocus,
            style,
            inputType,
            inputStyle,
            defaultValue,
            helpText,
            onChange,
            className,
            inputClassName,
            disabled,
            children,
            ...other
        } = this.props;

        return <div className={HTML.classes('control', className, {disabled})} {...other}>
            <label htmlFor={name}>{label}</label>
            <input
                disabled={!!disabled}
                ref={e => {this.input = e}}
                value={this.state.value}
                id={name}
                type={inputType}
                className={HTML.classes('input', inputClassName)} placeholder={placeholder}
                onChange={this.handleChange}
                style={inputStyle}
            />
            {helpText ? <p className="help-text">{helpText}</p> : null}
            {children}
        </div>;
    }
}

export default InputControl;
