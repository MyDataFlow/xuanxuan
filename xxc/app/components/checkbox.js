import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';
import timeSequence from '../utils/time-sequence';

/**
 * Checkbox component
 *
 * @export
 * @class Checkbox
 * @extends {Component}
 */
export default class Checkbox extends PureComponent {
    /**
     * Default properties values
     *
     * @static
     * @memberof Checkbox
     */
    static defaultProps = {
        checked: false,
        label: null,
        className: null,
        inputProps: null,
        onChange: null,
        children: null,
    }

    /**
     * Properties types
     *
     * @static
     * @memberof Checkbox
     */
    static propTypes = {
        checked: PropTypes.bool,
        label: PropTypes.string,
        className: PropTypes.string,
        inputProps: PropTypes.object,
        onChange: PropTypes.func,
        children: PropTypes.any,
    }

    /**
     * Create an instance of checkbox component
     * @param {any} props
     * @memberof Checkbox
     */
    constructor(props) {
        super(props);
        this._controlId = `checkbox-${timeSequence()}`;
    }

    /**
     * Handle checkbox change event
     * @private
     * @memberof Checkbox
     */
    handleCheckboxChange = e => {
        if (this.props.onChange) {
            this.props.onChange(e.target.checked, e);
        }
    };

    /**
     * React render method
     *
     * @returns
     * @memberof Checkbox
     */
    render() {
        const {
            checked,
            label,
            children,
            className,
            inputProps,
            onChange,
            ...other
        } = this.props;

        return (<div className={HTML.classes('checkbox', className, {checked})} {...other}>
            <input id={this._controlId} checked={checked} type="checkbox" onChange={this.handleCheckboxChange} {...inputProps} />
            {label && <label htmlFor={this.controlId}>{label}</label>}
        </div>);
    }
}
