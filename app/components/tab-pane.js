import React, {Component, PropTypes} from 'react';

export default class TabPane extends Component {
    static propTypes = {
        label: PropTypes.any,
        children: PropTypes.any,
    };

    static defaultProps = {
        label: 'tab',
        children: null,
    };

    render() {
        let {
            label,
            children,
            ...other
        } = this.props;

        return <div {...other}>{children}</div>;
    }
}
