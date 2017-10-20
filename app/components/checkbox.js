import React, {Component, PropTypes} from 'react';
import HTML from '../utils/html-helper';
import timeSequence from '../utils/time-sequence';

export default class Checkbox extends Component {

    static defaultProps = {
        checked: false,
        label: null,
        className: null,
        inputProps: null,
        onChange: null,
    }

    static propTypes = {
        checked: PropTypes.bool,
        label: PropTypes.string,
        className: PropTypes.string,
        inputProps: PropTypes.object,
        onChange: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.controlId = `checkbox-${timeSequence()}`;
    }

    handleCheckboxChange = e => {
        if(this.props.onChange) {
            this.props.onChange(e.target.checked, e);
        }
    };

    render() {
        let {
            checked,
            label,
            children,
            className,
            inputProps,
            onChange,
            ...other
        } = this.props;

        return (<div className={HTML.classes('checkbox', className, {checked})} {...other}>
          <input id={this.controlId} checked={checked} type="checkbox" onChange={this.handleCheckboxChange} {...inputProps} />
          {label && <label htmlFor={this.controlId}>{label}</label>}
        </div>);
    }
}
