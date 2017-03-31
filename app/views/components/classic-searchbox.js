import React, {
    Component,
    PropTypes
}                          from 'react';
import Theme               from '../../theme';
import CloseIcon           from 'material-ui/svg-icons/navigation/close';
import SearchIcon          from 'material-ui/svg-icons/action/search';
import Helper              from 'Helper';

class ClassicSearchBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.defaultValue,
            hover: false,
            focus: false,
            isEmpty: Helper.isEmpty(this.props.defaultValue)
        };
    }

    static defaultProps = {
        defaultValue: ''
        hintText: '',
        onValueChange: null
    };

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        if(this.state.value !== value) {
            const isEmpty = Helper.isEmpty(value);
            this.setState({value, isEmpty});
            this.props.onValueChange && this.props.onValueChange(value, isEmpty);
        }
    }

    render() {
        let {
            style,
            inputStyle,
            hintText,
            ...other
        } = this.props;

        inputStyle = Object.assign({}, inputStyle, {

        });

        return <div {...other} style={style}>
            <input
                style={inputStyle}
                type="search"
                placeholder={hintText}
                onMouseEnter={e => this.setState({hover: true})}
                onMouseLeave={e => this.setState({hover: false})}
                onFocus={e => this.setState({focus: true})}
                onBlur={e => this.setState({focus: false})}
                onInput={this.handleInputChange}
                onChange={this.handleInputChange}
            />
            <SearchIcon color={Theme.color.icon} />
        </div>
    }
}

default export ClassicSearchBox;
