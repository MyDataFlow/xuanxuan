import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../utils/html-helper';

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
        inputClassName: 'rounded'
    };

    constructor(props) {
        super(props);
        this.state = {value: this.props.defaultValue};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
        this.props.onChange && this.props.onChange(event.target.value, event);
    }

    componentDidMount() {
        if(this.props.autoFocus) {
            this.autoFocusTask = setTimeout(() => {
                this.control.focus();
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

    render() {
        let {
            label,
            placeholder,
            autoFocus,
            style,
            inputType,
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
            <input disabled={!!disabled} ref={e => {this.control = e}} value={this.state.value} name={name} type={inputType} className={HTML.classes('input', inputClassName)} placeholder={placeholder} onChange={this.handleChange}/>
            {helpText ? <p className="help-text">{helpText}</p> : null}
            {children}
        </div>;
    }
}

export default InputControl;
