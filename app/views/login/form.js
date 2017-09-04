import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import InputControl from '../../components/input-control';
import Lang from '../../lang';
import HTML from '../../utils/html-helper';
import App from '../../core';
import StringHelper from '../../utils/string-helper';

class FormView extends Component {

        constructor(props) {
            super(props);

            const lastSavedUser = App.profile.getLastSavedUser();

            this.state = {
                serverUrl: lastSavedUser && (lastSavedUser.serverUrl || lastSavedUser.server),
                account: lastSavedUser && lastSavedUser.account,
                password: lastSavedUser && lastSavedUser.password,
                message: '',
                submitable: false,
                logining: false
            };

            this.state.submitable = StringHelper.isNotEmpty(this.state.serverUrl) && StringHelper.isNotEmpty(this.state.account) && StringHelper.isNotEmpty(this.state.password);
        }

        login() {
            App.server.login({
                server: this.state.serverUrl,
                account: this.state.account,
                password: this.state.password
            }).then(() => {
                this.setState({logining: false});
            }).catch(error => {
                if(DEBUG) {
                    console.error('Login failed with error:', error);
                }
                this.setState({message: Lang.error(error), logining: false});
            });
        }

        handleInputFieldChange(field, value) {
            const userState = {
                account: this.state.account,
                password: this.state.password,
                serverUrl: this.state.serverUrl,
                message: ''
            };
            userState[field] = value;
            userState.submitable = StringHelper.isNotEmpty(userState.serverUrl) && StringHelper.isNotEmpty(userState.account) && StringHelper.isNotEmpty(userState.password);

            this.setState(userState);
        }

        handleLoginBtnClick = () => {
            this.setState({
                logining: true
            }, () => {
                this.login()
            });
        }

        componentDidMount() {
            if(DEBUG && this.state.submitable) {
                this.login();
            }
        }

        render() {
            let {
                className,
                children,
                ...other
            } = this.props;

            return <div className={HTML.classes('app-login-form', className)}>
                {this.state.message && <div className="app-login-message danger box">{this.state.message}</div>}
                <InputControl
                    defaultValue={this.state.serverUrl}
                    autoFocus={true}
                    disabled={this.state.logining}
                    label={Lang['login.serverUrl.label']}
                    placeholder={Lang['login.serverUrl.hint']}
                    onChange={this.handleInputFieldChange.bind(this, 'serverUrl')}
                />
                <InputControl
                    defaultValue={this.state.account}
                    disabled={this.state.logining}
                    label={Lang['login.account.label']}
                    placeholder={Lang['login.account.hint']}
                    onChange={this.handleInputFieldChange.bind(this, 'account')}
                />
                <InputControl
                    defaultValue={this.state.password}
                    disabled={this.state.logining}
                    className="space"
                    label={Lang['login.password.label']}
                    onChange={value => this.setState({})}
                    inputType="password"
                    onChange={this.handleInputFieldChange.bind(this, 'password')}
                />
                <button
                    type="button"
                    disabled={!this.state.submitable || this.state.logining}
                    className={HTML.classes('btn block rounded', this.state.submitable ? 'primary' : 'gray')}
                    onClick={this.handleLoginBtnClick}
                >
                    {Lang[this.state.logining ? 'login.btn.logining' : 'login.btn.label']}
                </button>
            </div>;
        }
    }

    export default FormView;
