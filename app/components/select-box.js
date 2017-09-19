import React, {Component} from 'react';
import HTML from '../utils/html-helper';

class Selectbox extends Component {

    handleSelectChange = e => {
        this.props.onChange && this.props.onChange(e.target.value, e);
    };

    render() {
        let {
            value,
            children,
            className,
            selectProps,
            selectClassName,
            options,
            onChange,
            ...other
        } = this.props;

        return <div className={HTML.classes('select', className)} {...other}>
            <select className={selectClassName} value={value} onChange={this.handleSelectChange} {...selectProps}>
            {
                options && options.map(option => {
                    if(!option) {
                        return null;
                    }
                    if(typeof option !== 'object') {
                        option = {value: option, label: option};
                    }
                    return <option key={option.value} value={option.value}>{option.label}</option>
                })
            }
            {children}
            </select>
        </div>;
    }
}

export default Selectbox;
