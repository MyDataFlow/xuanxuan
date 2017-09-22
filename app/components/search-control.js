import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../utils/html-helper';
import InputControl from './input-control';
import Icon from './icon';
import StringHelper from '../utils/string-helper';
import DelayAction from '../utils/delay-action';

class SearchControl extends Component {

    static defaultProps = {
        placeholder: Lang.string('common.search'),
    };

    constructor(props) {
        super(props);
        this.state = {
            focus: false,
            empty: StringHelper.isEmpty(this.props.defaultValue)
        };

        if(this.props.onSearchChange) {
            this.delaySearchChangeTask = new DelayAction((searchValue) => {
                this.props.onSearchChange(searchValue);
            }, this.props.changeDelay || 100);
        }
    }

    componentWillUnmount() {
        if(this.delaySearchChangeTask) {
            this.delaySearchChangeTask.destroy();
        }
    }

    handleOnInputFocus = e => {
        this.setState({focus: true});
        this.props.onFocus && this.props.onFocus(e);
    }

    handleOnInputBlur = e => {
        this.setState({focus: false});
        this.props.onBlur && this.props.onBlur(e);
    }

    handleOnInputChange = value => {
        this.setState({empty: StringHelper.isEmpty(value)});
        if(this.delaySearchChangeTask) {
            this.delaySearchChangeTask.do(value);
        }
    }

    handleOnCloseBtnClick = () => {
        this.inputControl.setValue('');
        this.inputControl.focus();
    }

    render() {
        let {
            className,
            children,
            onSearchChange,
            changeDelay,
            ...other
        } = this.props;

        return <InputControl
            className={HTML.classes('search', className, {
                focus: this.state.focus,
                empty: this.state.empty
            })}
            label = {<Icon name="search"/>}
            onFocus={this.handleOnInputFocus}
            onBlur={this.handleOnInputBlur}
            onChange={this.handleOnInputChange}
            {...other}
            ref={e => this.inputControl = e}
        >
            <Icon name="close" onClick={this.handleOnCloseBtnClick} className="close state"/>
        </InputControl>;
    }
}

export default SearchControl;
