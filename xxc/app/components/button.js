import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../utils/html-helper';
import Skin from '../utils/skin';
import Icon from '../components/icon';

/**
 * Button component
 *
 * @export
 * @class Button
 * @extends {Component}
 */
export default class Button extends PureComponent {
    /**
     * Default properties values
     *
     * @static
     * @memberof Button
     * @return {Object}
     */
    static defaultProps = {
        skin: null,
        icon: null,
        label: null,
        className: null,
        style: null,
        children: null,
        type: 'button',
        btnClass: 'btn'
    }

    /**
     * Properties types
     *
     * @static
     * @memberof Button
     * @return {Object}
     */
    static propTypes = {
        skin: PropTypes.any,
        icon: PropTypes.string,
        label: PropTypes.any,
        className: PropTypes.string,
        style: PropTypes.object,
        children: PropTypes.any,
        btnClass: PropTypes.string,
        type: PropTypes.string.isRequired
    }

    /**
     * React render method
     *
     * @returns
     * @memberof Avatar
     */
    render() {
        const {
            skin,
            icon,
            label,
            className,
            children,
            style,
            type,
            btnClass,
            ...other
        } = this.props;

        let iconView = null;
        if (icon) {
            if (typeof icon === 'string') {
                iconView = <Icon name={icon} />;
            } else if (typeof icon === 'object' && React.isValidElement(icon)) {
                iconView = <Icon {...icon} />;
            } else {
                iconView = icon;
            }
        }

        let labelView = null;
        if (label) {
            labelView = typeof lable !== 'object' ? <span className="text">{label}</span> : label;
        }

        const buttonStyle = Object.assign(skin ? Skin.style(skin) : {}, style);

        if (type === 'a') {
            return <a {...other} className={classes(btnClass, className, {'btn-icon': !labelView && !children})} style={buttonStyle}>{iconView}{labelView}{children}</a>;
        }
        return <button {...other} type={type} className={classes('btn', className, {'btn-icon': !labelView && !children})} style={buttonStyle}>{iconView}{labelView}{children}</button>;
    }
}
