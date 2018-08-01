import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import {STATUS} from '../../core/models/member';
import Lang from '../../lang';
import App from '../../core';
import replaceViews from '../replace-views';

const statusColors = {
    unverified: '#ccc',
    disconnect: '#ccc',
    logined: '#18ffff',
    online: '#00e676',
    busy: '#ffab00',
    away: '#ff1744',
};


class StatusDot extends PureComponent {
    static get StatusDot() {
        return replaceViews('common/status-dot', StatusDot);
    }

    static propTypes = {
        size: PropTypes.number,
        className: PropTypes.string,
        label: PropTypes.any,
        style: PropTypes.object,
        status: PropTypes.any,
    }

    static defaultProps = {
        size: 14,
        className: 'circle',
        style: null,
        label: null,
        status: null,
    };

    render() {
        let {
            size,
            className,
            style,
            status,
            label,
            ...other
        } = this.props;

        if (App.profile.isUserOnline) {
            status = STATUS.getName(status);
        } else {
            status = 'disconnect';
        }
        style = Object.assign({
            backgroundColor: statusColors[status],
            border: '1px solid #fff'
        }, style);

        if (size) {
            size = HTML.rem(size);
            style.width = size;
            style.height = size;
        }

        const dotView = <span className={HTML.classes('inline-block status-dot', className, `status-${status}`)} style={style} {...other} />;

        if (label) {
            if (label === true) {
                label = Lang.string(`member.status.${status === 'unverified' ? 'offline' : status}`);
            }
            return <div className="app-member-status">{dotView} &nbsp; <span className="status-label muted">{label}</span></div>;
        }
        return dotView;
    }
}

export default StatusDot;
