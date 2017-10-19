import React, {Component, PropTypes} from 'react';

export default class ClickOutsideWrapper extends Component {

    static defaultProps = {
        onClickOutside: null,
        children: null
    }

    static propTypes = {
        onClickOutside: PropTypes.func,
        children: PropTypes.any
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside = event => {
        if (this.props.onClickOutside && this.wrapper && !this.wrapper.contains(event.target)) {
            this.props.onClickOutside(event, this);
        }
    }

    render() {
        const {
            onClickOutside,
            children,
            ...other
        } = this.props;

        return (
          <div ref={e => {this.wrapper = e;}} {...other}>
            {children}
          </div>
        );
    }
}
