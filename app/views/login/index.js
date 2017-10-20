import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HTML from '../../utils/html-helper';
import Config from 'Config';
import LoginForm from './form';
import BuildInfo from '../common/build-info';
import App from '../../core';

class IndexView extends Component {

    render() {
        let {
            className,
            children,
            userStatus,
            ...other
        } = this.props;

        return <div className={HTML.classes('app-login center-content', className)} {...other}>
            <section>
                <header className="text-center space-sm">
                    <img src={`${Config.media['image.path']}logo-inverse.png`} />
                </header>
                <LoginForm className="rounded layer has-padding-xl"/>
                {App.ui.entryParams.loginTip && <div className="app-login-tip small text-center has-padding-v muted text-white">{App.ui.entryParams.loginTip}</div>}
                {children}
            </section>
            <BuildInfo className="dock-right dock-bottom small has-padding text-white muted"/>
        </div>;
    }
}

export default IndexView;
