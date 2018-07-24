import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Platform from 'Platform';
import HTML from '../../utils/html-helper';
import Icon from '../../components/icon';
import Lang from '../../lang';
import User from '../../core/profile/user';
import {UserListItem} from '../common/user-list-item';
import replaceViews from '../replace-views';

class SwapUser extends Component {
    static get SwapUser() {
        return replaceViews('login/swap-user', SwapUser);
    }

    static propTypes = {
        className: PropTypes.string,
        identify: PropTypes.string,
        onSelectUser: PropTypes.func,
    };

    static defaultProps = {
        className: null,
        identify: null,
        onSelectUser: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            hover: ''
        };
    }

    handleMouseEnter(identify) {
        this.setState({hover: identify});
    }

    handleMouseLeave = () => {
        this.setState({hover: ''});
    }

    handleDeleteBtnClick(user, e) {
        Platform.config.removeUser(user);
        this.forceUpdate();
        e.stopPropagation();
    }

    render() {
        const {
            identify,
            className,
            onSelectUser,
            ...other
        } = this.props;

        const userList = Platform.config.userList();

        return (<div
            {...other}
            className={HTML.classes('app-swap-user list has-padding-v', className)}
        >
            {
                userList.map(user => {
                    user = User.create(user);
                    const userIdentify = user.identify;
                    const isHover = this.state.hover === userIdentify;
                    const isActive = userIdentify === identify;
                    return (<UserListItem
                        key={user.identify}
                        user={user}
                        onMouseEnter={this.handleMouseEnter.bind(this, userIdentify)}
                        onMouseLeave={this.handleMouseLeave}
                        className={isActive ? 'primary-pale' : ''}
                        onClick={onSelectUser.bind(null, user)}
                    >
                        {
                            isHover ? <div style={{zIndex: 10}} className="hint--top" data-hint={Lang.string('common.remove')}><button onClick={this.handleDeleteBtnClick.bind(this, user)} type="button" className="btn iconbutton rounded"><Icon name="delete text-danger" /></button></div> : isActive ? <Icon name="check text-success" /> : null
                        }
                    </UserListItem>);
                })
            }
        </div>);
    }
}

export default SwapUser;
