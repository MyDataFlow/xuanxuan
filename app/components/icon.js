import React, {Component, PropTypes} from 'react';
import HTML from '../utils/html-helper';

export default class MDIcon extends Component {

    static defaultProps = {
        size: 0,
        name: '',
        color: '',
        className: '',
        square: true,
        style: null
    };

    static propTypes = {
        size: PropTypes.number,
        style: PropTypes.object
    }

    render() {
        let {
            square,
            size,
            color,
            name,
            style,
            children,
            className,
            ...other
        } = this.props;
        style = Object.assign({}, style);
        if(size) {
            if(size < 12) size *= 12;
            style.fontSize = HTML.rem(size);
        }
        if(color) {
            style.color = color;
        }
        if(square && size) {
            style.lineHeight = style.fontSize;
            style.height = style.fontSize;
            style.width = style.fontSize;
        }
        return <i style={style} {...other} className={HTML.classes(`icon mdi mdi-${name}`, className)}>{children}</i>;
    }
}
