import React, {
    Component,
    PropTypes
}                          from 'react';
import Theme               from '../../theme';
import CloseIcon           from 'material-ui/svg-icons/navigation/close';
import SearchIcon          from 'material-ui/svg-icons/action/search';
import Helper              from 'Helper';
import Lang                from 'Lang';

class ClassicSearchBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.defaultValue,
            hover: false,
            focus: false,
            isEmpty: Helper.isEmptyString(this.props.defaultValue)
        };
    }

    static defaultProps = {
        defaultValue: '',
        hintText: Lang.common.search,
        onValueChange: null,
        delayValueChangeTime: 100
    };

    _handleInputChange(event) {
        const value = this.input.value;
        if(this.state.value !== value) {
            const isEmpty = Helper.isEmptyString(value);
            this.setState({value, isEmpty});
            if(this.props.onValueChange) {
                if(this.props.delayValueChangeTime) {
                    clearTimeout(this.valueChangeCallTask);
                    this.valueChangeCallTask = setTimeout(() => {
                        this.props.onValueChange(this.state.value, this.state.isEmpty);
                    }, this.props.delayValueChangeTime);
                } else {
                    this.props.onValueChange(value, isEmpty);
                }
            }
        }
    }

    _handleCloseBtnClick() {
        this.input.value = '';
        this._handleInputChange();
        this.focus();
    }

    focus() {
        this.input.focus();
    }

    render() {
        let {
            style,
            inputStyle,
            hintText,
            autofocus,
            inputAttr,
            ...other
        } = this.props;

        style = Object.assign({}, {
            padding: 8,
            position: 'relative'
        }, style);
        inputStyle = Object.assign({}, {
            height: 32,
            border: '1px solid transparent',
            backgroundColor: 'rgba(255,255,552,.65)',
            display: 'block',
            paddingLeft: 32,
            paddingRight: 32,
            paddingTop: 4,
            paddingBottom: 4,
            transition: Theme.transition.css('normal', 'background-color', 'border', 'padding'),
            boxSizing: 'border-box',
            width: '100%',
            borderRadius: 2,
        }, inputStyle);
        let searchIconStyle = {
            display: 'block',
            position: 'absolute',
            left: 14,
            top: 14,
            width: 20,
            height: 20,
            transition: Theme.transition.css('normal', 'opacity', 'transform'),
            opacity: 1,
            transform: 'scale(1)'
        };
        let closeIconStyle = {
            display: 'block',
            position: 'absolute',
            right: 14,
            top: 14,
            width: 20,
            height: 20,
            transition: Theme.transition.css('normal', 'opacity', 'transform'),
            opacity: 0,
            visibility: 'hidden',
            transform: 'scale(0)',
            cursor: 'pointer'
        }
        if(this.state.focus) {
            inputStyle.backgroundColor = '#fff';
            inputStyle.outline         = 'none';
            inputStyle.border          = '1px solid rgba(0,0,0,.2)';
            inputStyle.paddingLeft     = 8;
            searchIconStyle.opacity    = 0;
            searchIconStyle.transform  = 'scale(0)';
        } else if(this.state.hover) {
            inputStyle.backgroundColor = '#fff';
            inputStyle.border          = '1px solid rgba(0,0,0,.1)';
        }
        if(!this.state.isEmpty) {
            closeIconStyle.opacity    = 1;
            closeIconStyle.transform  = 'scale(1)';
            closeIconStyle.visibility = 'visible';
        }

        return <div {...other} style={style}>
            <input {...inputAttr}
                ref={e => {this.input = e}}
                value={this.state.value}
                style={inputStyle}
                placeholder={hintText}
                onMouseEnter={e => {
                    this.setState({hover: true});
                    this.props.onHoverChange && this.props.onHoverChange(true);
                }}
                onMouseLeave={e => {
                    this.setState({hover: false});
                    this.props.onHoverChange && this.props.onHoverChange(false);
                }}
                onFocus={e => {
                    this.setState({focus: true});
                    this.props.onFocusChange && this.props.onFocusChange(true);
                }}
                onBlur={e => {
                    this.setState({focus: false});
                    this.props.onFocusChange && this.props.onFocusChange(false);
                }}
                onInput={this._handleInputChange.bind(this)}
                onChange={this._handleInputChange.bind(this)}
            />
            <SearchIcon color={Theme.color.icon} hoverColor={Theme.color.primary1} style={searchIconStyle} onClick={this.focus.bind(this)} />
            <CloseIcon color={Theme.color.icon} hoverColor={Theme.color.primary1} style={closeIconStyle} onClick={this._handleCloseBtnClick.bind(this)}/>
        </div>
    }
}

export default ClassicSearchBox;
