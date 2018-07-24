import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';
import Icon from './icon';
import Avatar from './avatar';

/**
 * ListItem component
 *
 * @export
 * @class ListItem
 * @extends {Component}
 */
export default class ListItem extends PureComponent {
    /**
     * Default properties values
     *
     * @static
     * @memberof ListItem
     * @return {Object}
     */
    static defaultProps = {
        avatar: null,
        icon: null,
        title: null,
        subtitle: null,
        children: null,
        actions: null,
        className: null,
        divider: false,
        type: 'a'
    }

    /**
     * Properties types
     *
     * @static
     * @memberof ListItem
     * @return {Object}
     */
    static propTypes = {
        type: PropTypes.string,
        avatar: PropTypes.any,
        icon: PropTypes.any,
        title: PropTypes.any,
        subtitle: PropTypes.any,
        children: PropTypes.any,
        actions: PropTypes.any,
        className: PropTypes.string,
        divider: PropTypes.bool,
    }

    /**
     * React render method
     *
     * @returns
     * @memberof ListItem
     */
    render() {
        const {
            type,
            avatar,
            icon,
            title,
            subtitle,
            children,
            actions,
            divider,
            className,
            ...other
        } = this.props;

        const iconView = Icon.render(icon);
        const avatarView = Avatar.render(avatar, iconView);

        let titleView = null;
        if (title) {
            if (React.isValidElement(title)) {
                titleView = title;
            } else if (title) {
                titleView = <div className="title">{title}</div>;
            }
        }
        let subtitleView = null;
        if (subtitle) {
            if (React.isValidElement(subtitle)) {
                subtitleView = subtitle;
            } else if (subtitle) {
                subtitleView = <div className="subtitle">{subtitle}</div>;
            }
        }
        let contentView = null;
        const multiLines = subtitleView || children;
        if (multiLines) {
            contentView = (<div className="content">
                {titleView}
                {subtitleView}
                {children}
            </div>);
        } else {
            contentView = titleView;
        }

        return React.createElement(type, {
            className: HTML.classes(
                'app-list-item',
                className,
                {divider, 'with-avatar': !!avatarView, 'multi-lines': multiLines}
            ),
            ...other
        }, avatarView, iconView, contentView, actions);
    }
}
