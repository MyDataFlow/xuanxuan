import React, {Component} from 'react';
import HTML from '../utils/html-helper';
import Icon from './icon';

class Spinner extends Component {

    static defaultProps = {
        iconSize: 24,
        iconClassName: '',
        iconName: 'loading',
        label: '',
        className: '',
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

        return <div className={HTML.classes('spinner', className)} {...other}>
            <Icon name={iconName} className={iconClassName} size={iconSize}/>
            {label && <div className="muted small title">{label}</div>}
            {children}
        </div>;
    }
}

export default Spinner;
