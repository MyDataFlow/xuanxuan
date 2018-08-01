import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../utils/html-helper';
import Icon from './icon';

class Spinner extends PureComponent {
    static propTypes = {
        iconSize: PropTypes.number,
        iconClassName: PropTypes.string,
        iconName: PropTypes.string,
        label: PropTypes.any,
        className: PropTypes.string,
        children: PropTypes.any,
    };

    static defaultProps = {
        iconSize: 24,
        iconClassName: 'spin text-gray inline-block',
        iconName: 'loading',
        label: '',
        className: '',
        children: null,
    };

    render() {
        let {
            iconSize,
            iconName,
            iconClassName,
            label,
            children,
            className,
            ...other
        } = this.props;

        return (<div className={HTML.classes('spinner text-center', className)} {...other}>
            <Icon name={iconName} className={iconClassName} size={iconSize} />
            {label && <div className="muted small title">{label}</div>}
            {children}
        </div>);
    }
}

export default Spinner;
