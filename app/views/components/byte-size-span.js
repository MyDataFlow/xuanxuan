import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';
import Helper              from 'Helper';

const ByteSizeSpan = React.createClass({
    mixins: [PureRenderMixin],

    getDefaultProps() {
        return {
            fixed: 2,
            unit: null,
        };
    },

    render() {

        let {
            size,
            fixed,
            unit,
            ...other
        } = this.props;

        return <span {...other}>{Helper.formatBytes(size, fixed, unit)}</span>;
    }
});

export default ByteSizeSpan;
