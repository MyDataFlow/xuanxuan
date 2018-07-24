import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';
import Icon from './icon';
import Avatar from './avatar';

/**
 * Heading component
 *
 * @export
 * @class Heading
 * @extends {Component}
 */
export default class Heading extends PureComponent {
    /**
     * Default properties values
     *
     * @static
     * @memberof Heading
     * @return {Object}
     */
    static defaultProps = {
        avatar: null,
        icon: null,
        title: null,
        children: null,
        nav: null,
        className: null,
        type: 'a',
    }

    /**
     * Properties types
     *
     * @static
     * @memberof Heading
     * @return {Object}
     */
    static propTypes = {
        avatar: PropTypes.any,
        icon: PropTypes.any,
        title: PropTypes.any,
        children: PropTypes.any,
        nav: PropTypes.any,
        className: PropTypes.string,
        type: PropTypes.string
    }

    /**
     * React render method
     *
     * @returns
     * @memberof Heading
     */
    render() {
        const {
            type,
            nav,
            avatar,
            icon,
            title,
            children,
            className,
            ...other
        } = this.props;

        let iconView = null;
        if (icon) {
            if (React.isValidElement(icon)) {
                iconView = icon;
            } else if (typeof icon === 'object') {
                iconView = <Icon {...icon} />;
            } else if (icon) {
                iconView = <Icon name={icon} />;
            }
        }

        let avatarView = null;
        if (avatar) {
            if (avatar === true && iconView) {
                avatarView = <Avatar icon={icon} />;
            } else if (React.isValidElement(avatar)) {
                avatarView = avatar;
            } else if (typeof avatar === 'object') {
                avatarView = <Avatar {...avatar} />;
            } else if (avatar) {
                avatarView = <Avatar auto={avatar} />;
            }
        }

        let titleView = null;
        if (title) {
            if (React.isValidElement(title)) {
                titleView = title;
            } else if (title) {
                titleView = <div className="title">{title}</div>;
            }
        }

        return React.createElement(type, {
            className: HTML.classes(
                'app-heading',
                className,
            ),
            ...other
        }, avatarView, iconView, titleView, nav, children);
    }
}
