import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import HTML from '../../utils/html-helper';
import App from '../../core';
import Lang from '../../lang';
import Member from '../../core/models/member';
import Avatar from '../../components/avatar';
import replaceViews from '../replace-views';

const CONNECT_TIME_TICK = 5;

class GlobalMessage extends PureComponent {
    static get GlobalMessage() {
        return replaceViews('main/global-message', GlobalMessage);
    }

    static propTypes = {
        className: PropTypes.string,
    };

    static defaultProps = {
        className: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            userStatus: '',
            tick: 0,
            connecting: false,
            disconnect: false,
            failMessage: ''
        };
    }

    componentDidMount() {
        this.onUserStatusChangeHandler = App.profile.onUserStatusChange(user => {
            const userStatus = App.profile.userStatus;
            if (this.state.userStatus !== userStatus) {
                this.setState({userStatus});
                if (Member.STATUS.isSame(userStatus, Member.STATUS.disconnect)) {
                    this.startConnect();
                } else {
                    this.stopConnect();
                }
            }
        });
    }

    componentWillUnmount() {
        App.events.off(this.onUserStatusChangeHandler);
        clearInterval(this.countTimer);
    }

    connect() {
        this.setState({
            connecting: true,
            failMessage: ''
        });
        App.server.login(App.profile.user).catch(error => {
            if (DEBUG) {
                console.error('Login failed with error:', error);
            }
            this.connectTimes += 1;
            this.setState({
                failMessage: Lang.error(error),
                connecting: false,
                tick: this.connectTimes * CONNECT_TIME_TICK
            });
        });
    }

    startConnect() {
        this.connectTimes = 0;
        this.setState({
            connecting: false,
            disconnect: true,
            tick: 0,
        });
        this.countTimer = setInterval(() => {
            const {
                connecting,
                tick,
            } = this.state;
            if (!connecting) {
                if (tick < 1) {
                    this.connect();
                } else {
                    this.setState({tick: tick - 1});
                }
            }
        }, 1000);
    }

    stopConnect() {
        this.setState({
            connecting: false,
            disconnect: false
        });
        clearInterval(this.countTimer);
    }

    reconnectNow() {
        if (!this.state.connecting) {
            this.connectTimes = Math.min(1, Math.floor(this.connectTimes / 2));
            this.connect();
        }
    }

    logout() {
        this.stopConnect();
        App.server.logout();
    }

    render() {
        const {
            className,
            ...other
        } = this.props;

        const {
            connecting,
            disconnect,
            tick,
        } = this.state;

        let contentView = null;
        if (disconnect) {
            if (connecting) {
                contentView = (<div className="heading">
                    <Avatar icon="loading spin" />
                    <div className="title">{Lang.string('login.autoConnet.connecting')}</div>
                    <nav className="nav">
                        <a onClick={this.logout.bind(this)}>{Lang.string('login.autoConnet.logout')}</a>
                    </nav>
                </div>);
            } else {
                contentView = (<div className="heading">
                    <Avatar icon={tick % 2 === 0 ? 'lan-disconnect' : 'lan-connect'} />
                    <div className="title">
                        {Lang.format(this.connectTimes ? 'login.autoConnet.faildAndWait' : 'login.autoConnet.wait', Math.max(0, tick))}
                        {this.state.failMessage ? <span data-hint={this.state.failMessage} className="hint--bottom">{Lang.string('login.autoConnet.errorDetail')}</span> : null}
                    </div>
                    <nav className="nav">
                        <a onClick={this.reconnectNow.bind(this)}>{Lang.string('login.autoConnet.conectIM')}</a>
                        <a onClick={this.logout.bind(this)}>{Lang.string('login.autoConnet.logout')}</a>
                    </nav>
                </div>);
            }
        }

        return (<div
            className={HTML.classes('app-global-message center-content', className, {
                'app-user-disconnet yellow': disconnect,
            })}
            {...other}
        >
            {contentView}
        </div>);
    }
}

export default GlobalMessage;
