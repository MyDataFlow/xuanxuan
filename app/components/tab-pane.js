import React, {PureComponent, PropTypes} from 'react';

export default class TabPane extends PureComponent {
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
