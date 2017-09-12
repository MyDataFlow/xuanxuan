import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import {STATUS} from '../../core/models/member';
import Lang from '../../lang';

const statusColors = {
    unverified: '#ccc',
    loginFailed: '#ccc',
    waitReconnect: '#ccc',
    logining: '#ccc',
    reconnecting: '#ccc',
    disconnect: '#ccc',
    logined: '#2979ff',
    online: '#76ff03',
    busy: '#ffea00',
    away: '#ff1744',
};


class StatusDot extends Component {

    static defaultProps = {
        size: 14,
        className: 'circle'
    };

    render() {
        let {
            size,
            className,
            style,
            children,
            status,
            label,
            ...other
        } = this.props;

        status = STATUS.getName(status);
        style = Object.assign({
            backgroundColor: statusColors[status],
            border: '1px solid #fff'
        }, style);

        if(size) {
            size = HTML.rem(size);
            style.width = size;
            style.height = size;
        }

        const dotView = <span className={HTML.classes('inline-block status-dot', className, `status-${status}`)} style={style} {...other}>{children}</span>;

        if(label) {
            if(label === true) {
                label = Lang.string(`member.status.${status}`);
            }
            return <div className="app-member-status">{dotView} &nbsp; <span className="status-label muted">{label}</span></div>;
        } else {
            return dotView;
        }
    }
}

export default StatusDot;
