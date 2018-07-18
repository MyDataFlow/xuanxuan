import React, {Component, PropTypes} from 'react';
import InputControl from './input-control';
import {getKeyDecoration, formatKeyDecoration} from '../utils/html-helper';

class HotkeyInputControl extends Component {
    static propTypes = {
        defaultValue: PropTypes.string,
        onChange: PropTypes.func,
        inputProps: PropTypes.object,
    };

    static defaultProps = {
        defaultValue: '',
        onChange: null,
        inputProps: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            value: formatKeyDecoration(props.defaultValue),
        };
    }

    changeValue(value) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
        this.setState({value});
    }

    handleKeyDownEvent = e => {
        if (e.keyCode === 8 || e.cod === 'Backspace') {
            this.changeValue('');
            return;
        }
        const shortcut = getKeyDecoration(e);
        this.changeValue(shortcut);
        e.preventDefault();
        e.stopPropagation();
    }

    getValue() {
        return this.state.value;
    }

    render() {
        const {
            onChange,
            defaultValue,
            inputProps,
            ...other
        } = this.props;

        return (<InputControl
            {...other}
            ref={e => {this.inputControl = e;}}
            value={this.state.value}
            inputProps={Object.assign({onKeyDown: this.handleKeyDownEvent}, inputProps)}
        />);
    }
}

export default HotkeyInputControl;
