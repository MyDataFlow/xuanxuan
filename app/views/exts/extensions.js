import React, {Component, PropTypes} from 'react';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import AppAvatar from '../../components/app-avatar';

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


        return (<div className={HTML.classes('app-ext-extensions', className)}>

        </div>);
    }
}
