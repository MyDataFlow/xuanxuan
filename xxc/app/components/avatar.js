import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
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
export default class Avatar extends PureComponent {
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
        foreColor: null,
        className: null,
        imageClassName: null,
        iconClassName: null,
        style: null,
        children: null,
        auto: null,
    }

    /**
     * Properties types
     *
     * @static
     * @memberof Avatar
     * @return {Object}
     */
    static propTypes = {
        auto: PropTypes.any,
        skin: PropTypes.any,
        image: PropTypes.any,
        icon: PropTypes.any,
        label: PropTypes.any,
        size: PropTypes.number,
        iconSize: PropTypes.number,
        className: PropTypes.string,
        foreColor: PropTypes.string,
        imageClassName: PropTypes.string,
        iconClassName: PropTypes.string,
        style: PropTypes.object,
        children: PropTypes.any
    }

    static render(avatar, iconView) {
        let avatarView = null;
        if (avatar) {
            if (avatar === true && iconView) {
                avatarView = <Avatar icon={iconView} />;
            } else if (React.isValidElement(avatar)) {
                avatarView = avatar;
            } else if (typeof avatar === 'object') {
                avatarView = <Avatar {...avatar} />;
            } else if (avatar) {
                avatarView = <Avatar auto={avatar} />;
            }
        }
        return avatarView;
    }

    /**
     * React render method
     *
     * @returns
     * @memberof Avatar
     */
    render() {
        let {
            auto,
            skin,
            image,
            icon,
            label,
            size,
            className,
            foreColor,
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

        if (foreColor) {
            style.color = foreColor;
        }

        if (auto) {
            if (typeof auto === 'string') {
                if (auto.startsWith('mdi-') || auto.startsWith('icon-')) {
                    icon = auto;
                } else if (auto.length === 1) {
                    label = auto;
                } else {
                    image = auto;
                }
            } else {
                icon = auto;
            }
        }

        let imageView = null;
        if (image) {
            if (React.isValidElement(image)) {
                imageView = image;
            } else {
                imageView = <img alt={image} src={image} className={imageClassName} />;
            }
        }
        let iconView = null;
        if (!image && icon) {
            if (React.isValidElement(icon)) {
                iconView = icon;
            } else {
                iconView = <Icon className={iconClassName} name={icon} size={iconSize} />;
            }
        }
        let labelView = null;
        if (!image && !icon && label) {
            if (React.isValidElement(label)) {
                labelView = label;
            } else {
                labelView = <span className="text">{label}</span>;
            }
        }

        return (<div className={HTML.classes('avatar', className)} {...other} style={style}>
            {imageView}
            {iconView}
            {labelView}
            {children}
        </div>);
    }
}
