import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';
import timeSequence from '../utils/time-sequence';
import Radio from './radio';

/**
 * Radio component
 *
 * @export
 * @class Radio
 * @extends {Component}
 */
export default class RadioGroup extends PureComponent {
    static Radio = Radio;

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
        radioProps: null,
        onChange: null,
        children: null,
        items: null,
        name: null,
    }

    /**
     * Properties types
     *
     * @static
     * @memberof Radio
     */
    static propTypes = {
        checked: PropTypes.bool,
        items: PropTypes.array,
        name: PropTypes.string,
        className: PropTypes.string,
        radioProps: PropTypes.object,
        onChange: PropTypes.func,
        children: PropTypes.any,
    }

    handeOnChange = e => {
        const {onChange} = this.props;
        if (onChange) {
            onChange(e.target.value, e);
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
            items,
            checked,
            children,
            className,
            radioProps,
            onChange,
            ...other
        } = this.props;

        const groupName = name || `radioGroup-${timeSequence()}`;

        return (<div className={HTML.classes('radio-group', className)} {...other} onChange={this.handeOnChange}>
            {
                items && items.map(item => {
                    const {
                        label,
                        value,
                        ...itemOther
                    } = item;
                    return <Radio name={groupName} label={label} {...itemOther} checked={checked === value} value={value} {...radioProps} />;
                })
            }
            {children}
        </div>);
    }
}
