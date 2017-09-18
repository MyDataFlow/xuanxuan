import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../utils/html-helper';
import Icon from './icon';

const getCodeFromString = (str) => {
    if(!str) {
        return 0;
    }
    return str.split('')
        .map(char => char.charCodeAt(0))
        .reduce((current, previous) => previous + current);
};

const getColorFromCode = (code, other = '70%, 60%') => {
    return `hsl(${(code * 43) % 360}, ${other})`;
};

class Avatar extends Component {

    render() {
        let {
            skin,
            lightSkin,
            image,
            icon,
            label,
            size,
            iconSize,
            className,
            iconClassName,
            children,
            style,
            ...other
        } = this.props;

        style = Object.assign({}, style);
        if(size) {
            style.width = HTML.rem(size);
            style.height = style.width;

            if(!iconSize) {
                iconSize = Math.floor(size * 0.5);
            }
        }

        if(skin) {
            if(lightSkin) {
                style.color = getColorFromCode(getCodeFromString(skin));
                style.backgroundColor = getColorFromCode(getCodeFromString(skin), '70%, 92%');
            } else {
                style.color = '#fff';
                style.backgroundColor = getColorFromCode(getCodeFromString(skin));
            }
        }

        return <div className={HTML.classes('avatar', className)} {...other} style={style}>
            {image && <img src={image}/>}
            {!image && icon && <Icon className={iconClassName} name={icon} size={iconSize}/>}
            {!image && !icon && label}
            {children}
        </div>;
    }
}

export default Avatar;
