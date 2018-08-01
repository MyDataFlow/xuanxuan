import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';
import Avatar from './avatar';

/**
 * AppAvatar component
 *
 * @export
 * @class AppAvatar
 * @extends {Component}
 */
export default class AppAvatar extends PureComponent {
    /**
     * Default properties values
     *
     * @static
     * @memberof AppAvatar
     * @return {Object}
     */
    static defaultProps = {
        avatar: null,
        label: null,
        className: null,
        children: null,
    }

    /**
     * Properties types
     *
     * @static
     * @memberof AppAvatar
     * @return {Object}
     */
    static propTypes = {
        avatar: PropTypes.any,
        label: PropTypes.any,
        className: PropTypes.string,
        children: PropTypes.any
    }

    /**
     * React render method
     *
     * @returns
     * @memberof AppAvatar
     */
    render() {
        const {
            avatar,
            label,
            className,
            children,
            ...other
        } = this.props;

        let avatarView = null;
        if (React.isValidElement(avatar)) {
            avatarView = avatar;
        } else if (typeof avatar === 'object') {
            avatarView = <Avatar {...avatar} />;
        } else {
            avatarView = <Avatar auto={avatar} />;
        }

        let labelView = null;
        if (React.isValidElement(label)) {
            labelView = label;
        } else {
            labelView = <div className="text">{label}</div>;
        }

        return (<a className={HTML.classes('app-avatar', className)} {...other}>
            {avatarView}
            {labelView}
            {children}
        </a>);
    }
}
