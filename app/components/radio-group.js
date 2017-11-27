import React, {Component, PropTypes} from 'react';
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
export default class RadioGroup extends Component {
    static Radio = Radio;
    static RadioGroup = RadioGroup;

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

    /**
     * Handle radio change event
     * @private
     * @memberof Radio
     */
    handleRadioChange = (name, value, checked) => {
        console.log('>', {name, value, checked});
    };

    handeOnChange = e => {
        console.log('>>', Object.assign({}, e));
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
