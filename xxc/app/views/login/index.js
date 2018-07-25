import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Config from 'Config';
import HTML from '../../utils/html-helper';
import {Form as LoginForm} from './form';
import {BuildInfo} from '../common/build-info';
import App from '../../core';
import replaceViews from '../replace-views';
import Member from '../../core/models/member';

class Index extends PureComponent {
    static get Index() {
        return replaceViews('login/index', Index);
    }

    static defaultProps = {
        className: null,
        userStatus: null,
        children: null,
    };
    static propTypes = {
        className: PropTypes.string,
        userStatus: PropTypes.any,
        children: PropTypes.any,
    };

    render() {
        const {
            className,
            userStatus,
            children,
            ...other
        } = this.props;

        return (<div className={HTML.classes('app-login center-content', className)} {...other}>
            <section>
                <header className="text-center space-sm">
                    <img src={`${Config.media['image.path']}logo-inverse.png`} alt="logo" />
                </header>
                <LoginForm className="rounded layer has-padding-xl" />
                {App.ui.entryParams.loginTip && <div className="app-login-tip small text-center has-padding-v muted text-white">{App.ui.entryParams.loginTip}</div>}
                {children}
            </section>
            <BuildInfo className="dock-right dock-bottom small has-padding text-white muted" />
        </div>);
    }
}

export default Index;
