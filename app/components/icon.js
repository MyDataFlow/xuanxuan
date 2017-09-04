import React, {Component} from 'react';
import HTML from '../utils/html-helper';

class MDIcon extends Component {

    static defaultProps = {
        size: 0,
        name: '',
        color: '',
        className: '',
        square: true
    };

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
        return <i style={style} {...other} className={HTML.classes(`mdi mdi-${name}`, className)}>{children}</i>;
    }
}

export default MDIcon;
