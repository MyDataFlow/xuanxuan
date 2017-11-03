import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';

export default class ExitsHomeView extends Component {
    static propTypes = {
        className: PropTypes.string,
    };

    static defaultProps = {
        className: null,
    };

    render() {
        const {
            className,
        } = this.props;


        return (<div className={HTML.classes('app-exts-home', className)}>
            home
        </div>);
    }
}
