import React, {Component} from 'react';
import HTML from '../utils/html-helper';
import StringHelper from '../utils/string-helper';

class Selectbox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            focus: false,
            empty: StringHelper.isEmpty(this.props.value)
        };
    }

    handleSelectChange = e => {
        const value = e.target.value;
        this.setState({empty: StringHelper.isEmpty(value)});
        this.props.onChange && this.props.onChange(value, e);
    };

    handleOnSelectFocus = e => {
        this.setState({focus: true});
        this.props.onFocus && this.props.onFocus(e);
    }

    handleOnSelectBlur = e => {
        this.setState({focus: false});
        this.props.onBlur && this.props.onBlur(e);
    }

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

        return <div className={HTML.classes('select', className, {
                focus: this.state.focus,
                empty: this.state.empty,
                normal: !this.state.focus
            })} {...other}
        >
            <select
                className={selectClassName}
                value={value}
                onChange={this.handleSelectChange}
                {...selectProps}
                onFocus={this.handleOnSelectFocus}
                onBlur={this.handleOnSelectBlur}
            >
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
