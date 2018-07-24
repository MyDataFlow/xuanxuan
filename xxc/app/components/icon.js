import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';

/**
 * Material design icon componet
 * All icons @see http://materialdesignicons.com
 *
 * @example <caption>Create a star icon</caption>
 * <MDIcon name="star" />
 *
 * @export
 * @class MDIcon
 * @extends {Component}
 */
export default class MDIcon extends PureComponent {
    /**
     * Default values of properties
     *
     * @static
     * @memberof MDIcon
     */
    static defaultProps = {
        size: 0,
        name: '',
        color: '',
        className: '',
        square: true,
        style: null,
        children: null
    };

    /**
     * Properties types
     *
     * @static
     * @memberof MDIcon
     */
    static propTypes = {
        size: PropTypes.number,
        style: PropTypes.object,
        square: PropTypes.bool,
        className: PropTypes.string,
        color: PropTypes.string,
        name: PropTypes.string,
        children: PropTypes.any
    }


    static render(icon, props) {
        let iconView = null;
        if (icon) {
            if (React.isValidElement(icon)) {
                iconView = icon;
            } else if (typeof icon === 'object') {
                iconView = <MDIcon {...icon} {...props} />;
            } else if (icon) {
                iconView = <MDIcon name={icon} {...props} />;
            }
        }
        return iconView;
    }

    /**
     * React life cycle method: render
     *
     * @returns
     * @memberof MDIcon
     */
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
        if (size) {
            if (size < 12) size *= 12;
            style.fontSize = HTML.rem(size);
        }
        if (color) {
            style.color = color;
        }
        if (square && size) {
            style.lineHeight = style.fontSize;
            style.height = style.fontSize;
            style.width = style.fontSize;
        }
        let iconName = '';
        if (name.startsWith('mdi-')) {
            iconName = `mdi ${name}`;
        } else if (name.startsWith('icon-')) {
            iconName = name;
        } else {
            iconName = `mdi mdi-${name}`;
        }
        return <i style={style} {...other} className={HTML.classes(`icon ${iconName}`, className)}>{children}</i>;
    }
}
