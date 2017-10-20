import React, {Component, PropTypes} from 'react';
import HTML from '../utils/html-helper';
import Skin from '../utils/skin';
import Icon from './icon';

/**
 * Avatar component
 *
 * @example <caption>Create a image avatar</caption>
 * <Avatar image="http://example.com/user-avatar.png" />
 *
 * @example <caption>Create a avatar with text</caption>
 * <Avatar label="福" />
 *
 * @example <caption>Set avatar skin color</caption>
 * <Avatar label="福" skin="23" />
 *
 * @example <caption>Set avatar size</caption>
 * <Avatar label="福" size="48" />
 *
 * @export
 * @class Avatar
 * @extends {Component}
 */
export default class Avatar extends Component {
    /**
     * Default properties values
     *
     * @static
     * @memberof Avatar
     * @return {Object}
     */
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
        children: null
    }

    /**
     * Properties types
     *
     * @static
     * @memberof Avatar
     * @return {Object}
     */
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
        children: PropTypes.any
    }

    /**
     * React render method
     *
     * @returns
     * @memberof Avatar
     */
    render() {
        let {
            skin,
            image,
            icon,
            label,
            size,
            className,
            imageClassName,
            iconClassName,
            children,
            style,
            iconSize,
            ...other
        } = this.props;

        style = Object.assign(skin ? Skin.style(skin) : {}, style);
        if (size) {
            style.width = HTML.rem(size);
            style.height = style.width;

            if (!iconSize) {
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
