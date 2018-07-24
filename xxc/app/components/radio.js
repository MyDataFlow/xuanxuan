import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';
import timeSequence from '../utils/time-sequence';

/**
 * Radio component
 *
 * @export
 * @class Radio
 * @extends {Component}
 */
export default class Radio extends Component {
    /**
     * Default properties values
     *
     * @static
     * @memberof Radio
     */
    static defaultProps = {
        checked: false,
        label: null,
        className: null,
        inputProps: null,
        onChange: null,
        children: null,
        innerView: null,
        disabled: false,
    }

    /**
     * Properties types
     *
     * @static
     * @memberof Radio
     */
    static propTypes = {
        checked: PropTypes.bool,
        disabled: PropTypes.bool,
        label: PropTypes.any,
        className: PropTypes.string,
        inputProps: PropTypes.object,
        onChange: PropTypes.func,
        children: PropTypes.any,
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        innerView: PropTypes.any,
    }

    /**
     * Create an instance of radio component
     * @param {any} props
     * @memberof Radio
     */
    constructor(props) {
        super(props);
        this._controlId = `radio-${timeSequence()}`;
    }

    /**
     * Handle radio change event
     * @private
     * @memberof Radio
     */
    handleRadioChange = e => {
        const {onChange, name, value} = this.props;
        if (onChange) {
            onChange(name, value, e.target.checked, e);
        }
    };

    /**
     * React render method
     *
     * @returns
     * @memberof Radio
     */
    render() {
        const {
            name,
            value,
            checked,
            disabled,
            label,
            innerView,
            children,
            className,
            inputProps,
            onChange,
            ...other
        } = this.props;

        return (<div className={HTML.classes('radio', className, {checked, disabled})} {...other}>
            <input disabled={disabled} name={name} id={this._controlId} checked={checked} type="radio" onChange={this.handleRadioChange} value={value} {...inputProps} />
            {label && <label htmlFor={this.controlId}>{label}</label>}
            {innerView}
            {children}
        </div>);
    }
}
