import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class ClickOutsideWrapper extends Component {

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside = event => {
        if (this.wrapper && !this.wrapper.contains(event.target)) {
            this.props.onClickOutside && this.props.onClickOutside(event, this);
        }
    }

    render() {
        let {
            onClickOutside,
            ...other
        } = this.props;

        return (
            <div ref={e => this.wrapper = e} {...other}>
                {this.props.children}
            </div>
        );
    }
}

export default ClickOutsideWrapper;
