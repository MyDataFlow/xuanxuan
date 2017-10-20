import React, {Component, PropTypes} from 'react';
import HTML from '../utils/html-helper';
import Skin from '../utils/skin';
import Icon from './icon';

export default class Avatar extends Component {

    static defaultProps = {
        skin: null,
        image: null,
        icon: null,
        label: null,
        size: null,
        iconSize: null,
        className: null,
        imageClassName: null,
        iconClassName: null,
        style: null,
    }

    static propTypes = {
        skin: PropTypes.any,
        image: PropTypes.string,
        icon: PropTypes.string,
        label: PropTypes.any,
        size: PropTypes.number,
        iconSize: PropTypes.number,
        className: PropTypes.string,
        imageClassName: PropTypes.string,
        iconClassName: PropTypes.string,
        style: PropTypes.object,
    }

    render() {
        let {
            skin,
            image,
            icon,
            label,
            size,
            iconSize,
            className,
            imageClassName,
            iconClassName,
            style,
            children,
            ...other
        } = this.props;

        style = Object.assign(skin ? Skin.style(skin) : {}, style);
        if(size) {
            style.width = HTML.rem(size);
            style.height = style.width;

            if(!iconSize) {
                iconSize = Math.floor(size * 0.5);
            }
        }

        return (<div className={HTML.classes('avatar', className)} {...other} style={style}>
          {image && <img alt={image} src={image} className={imageClassName} />}
          {!image && icon && <Icon className={iconClassName} name={icon} size={iconSize} />}
          {!image && !icon && label}
          {children}
        </div>);
    }
}
