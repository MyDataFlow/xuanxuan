import React, {Component} from 'react';
import HTML from '../utils/html-helper';

class Checkbox extends Component {

    handleCheckboxChange = e => {
        this.props.onChange && this.props.onChange(e.target.checked, e);
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

        return <div className={HTML.classes('checkbox', className, {checked})} {...other}>
            <input checked={checked} type="checkbox" onChange={this.handleCheckboxChange} {...inputProps}/>
            {label && <label>{label}</label>}
        </div>;
    }
}

export default Checkbox;
