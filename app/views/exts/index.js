import React, {Component, PropTypes} from 'react';
import {Link, Route, Redirect} from 'react-router-dom';
import HTML from '../../utils/html-helper';
import Lang from '../../lang';
import App from '../../core';
import ROUTES from '../common/routes';
import Icon from '../../components/icon';
import Home from './home';

export default class ExtsIndexView extends Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        hidden: PropTypes.bool,
        className: PropTypes.string,
    };

    static defaultProps = {
        hidden: false,
        className: null,
    };

    render() {
        const {
            hidden,
            className,
            match
        } = this.props;

        console.info('match', match);

        return (<div className={HTML.classes('app-exts dock primary', className, {hidden})}>
            <nav className="app-exts-nav nav dock dock-top">
                <Link className="active" to={ROUTES.exts.app.id('home')}>
                    <Icon name="apps" className="rounded" />
                    <span className="text">{Lang.string('exts.home.label')}</span>
                    <div title={Lang.string('common.close')} className="close rounded"><Icon name="close" /></div>
                </Link>
            </nav>
            <div className="app-exts-apps dock">
                <div className="app-exts-app app-exts-app-home dock scroll-y"><Home /></div>
            </div>
        </div>);
    }
}
