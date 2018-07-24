import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../utils/html-helper';
import StringHelper from '../utils/string-helper';

class Selectbox extends Component {
    static propTypes = {
        value: PropTypes.any,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        children: PropTypes.any,
        selectProps: PropTypes.object,
        className: PropTypes.string,
        selectClassName: PropTypes.string,
        options: PropTypes.array,
    };

    static defaultProps = {
        value: '',
        onChange: null,
        onFocus: null,
        onBlur: null,
        children: null,
        className: null,
        selectClassName: null,
        selectProps: null,
        options: null,
    };

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
        if (this.props.onChange) {
            this.props.onChange(value, e);
        }
    };

    handleOnSelectFocus = e => {
        this.setState({focus: true});
        if (this.props.onFocus) {
            this.props.onFocus(e);
        }
    }

    handleOnSelectBlur = e => {
        this.setState({focus: false});
        if (this.props.onBlur) {
            this.props.onBlur(e);
        }
    }

    focus() {
        this.selectBox.focus();
    }

    render() {
        const {
            value,
            children,
            className,
            selectProps,
            selectClassName,
            options,
            onChange,
            ...other
        } = this.props;

        return (<div
            className={classes('select', className, {
                focus: this.state.focus,
                empty: this.state.empty,
                normal: !this.state.focus
            })}
            {...other}
        >
            <select
                ref={e => {this.selectBox = e;}}
                className={selectClassName}
                value={value}
                onChange={this.handleSelectChange}
                {...selectProps}
                onFocus={this.handleOnSelectFocus}
                onBlur={this.handleOnSelectBlur}
            >
                {
                    options && options.map(option => {
                        if (!option) {
                            return null;
                        }
                        if (typeof option !== 'object') {
                            option = {value: option, label: option};
                        }
                        return <option key={option.value} value={option.value}>{option.label}</option>;
                    })
                }
                {children}
            </select>
        </div>);
    }
}

export default Selectbox;
