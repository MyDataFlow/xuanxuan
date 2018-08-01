import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InputControl from './input-control';
import {classes} from '../utils/html-helper';
import {getKeyDecoration, formatKeyDecoration, isOnlyModifyKeys} from '../utils/shortcut';
import Lang from '../lang';

class HotkeyInputControl extends Component {
    static propTypes = {
        defaultValue: PropTypes.string,
        className: PropTypes.string,
        onChange: PropTypes.func,
        inputProps: PropTypes.object,
    };

    static defaultProps = {
        defaultValue: '',
        onChange: null,
        inputProps: null,
        className: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            value: formatKeyDecoration(props.defaultValue),
            error: null
        };
    }

    changeValue(value, error = null) {
        const {onChange} = this.props;
        if (onChange) {
            onChange(value);
        }
        this.setState({value, error});
    }

    handleKeyDownEvent = e => {
        if (e.keyCode === 8 || e.cod === 'Backspace') {
            this.changeValue('');
            return;
        }
        const shortcut = getKeyDecoration(e);
        if (isOnlyModifyKeys(shortcut)) {
            this.changeValue(shortcut, Lang.string('setting.hotkeys.cantSetOnlyMotifyKeys'));
        } else {
            this.changeValue(shortcut);
        }
        e.preventDefault();
        e.stopPropagation();
    };

    handleBlurEvent = e => {
        if (isOnlyModifyKeys(this.state.value)) {
            this.changeValue('', Lang.string('setting.hotkeys.cantSetOnlyMotifyKeys'));
        }
    };

    getValue() {
        return this.state.value;
    }

    render() {
        const {
            onChange,
            defaultValue,
            className,
            inputProps,
            ...other
        } = this.props;

        return (<InputControl
            {...other}
            placeholder={defaultValue}
            className={classes(className, {'has-error': !!this.state.error})}
            helpText={this.state.error}
            ref={e => {this.inputControl = e;}}
            value={this.state.value}
            inputProps={Object.assign({onKeyDown: this.handleKeyDownEvent, onBlur: this.handleBlurEvent}, inputProps)}
        />);
    }
}

export default HotkeyInputControl;
