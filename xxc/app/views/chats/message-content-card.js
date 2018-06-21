import React, {Component, PropTypes} from 'react';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import replaceViews from '../replace-views';
import Button from '../../components/button';
import Avatar from '../../components/avatar';

export default class MessageContentCard extends Component {
    static propTypes = {
        baseClassName: PropTypes.string,
        className: PropTypes.string,
        card: PropTypes.object.isRequired,
    };

    static defaultProps = {
        baseClassName: 'layer rounded shadow-2',
        className: '',
    };

    static get MessageContentCard() {
        return replaceViews('chats/message-content-card', MessageContentCard);
    }

    handleActionButtonClick(action, e) {
        if (action.url && App.ui.openUrl(action.url, e.target)) {
            e.stopPropagation();
        } else if (action.click) {
            action.click(e);
            e.stopPropagation();
        }
    }

    render() {
        let {
            card,
            className,
            baseClassName,
            children,
            ...other
        } = this.props;

        const {image, title, subtitle, content, icon, actions, url} = card;
        const imageView = image ? (React.isValidElement(image) ? image : <div className="img" style={{backgroundImage: `url(${image})`}} />) : null;
        const titleView = title ? (React.isValidElement(title) ? title : <h4>{title}</h4>) : null;
        const subTitleView = subtitle ? (React.isValidElement(subtitle) ? subtitle : <h5>{subtitle}</h5>) : null;
        const avatarView = icon ? Avatar.render(icon) : null;
        const contentView = content ? <div className="content">{content}</div> : null;
        const actionsButtons = [];
        if (actions) {
            actions.forEach((action, idx) => {
                actionsButtons.push(<Button className={action.btnClass || 'rounded primary outline'} key={idx} label={action.label} icon={action.icon} onClick={this.handleActionButtonClick.bind(this, action)} />);
            });
        }

        return (<div
            className={classes('app-message-card', baseClassName, className, {
                'app-link state': !!url,
                'with-avatar': !!avatarView,
                'only-title': !contentView && !subTitleView && !actionsButtons.length
            })}
            data-url={url}
            {...other}
        >
            {imageView}
            <header>
                {avatarView}
                <hgroup>
                    {titleView}
                    {subTitleView}
                </hgroup>
            </header>
            {contentView}
            {actionsButtons && actionsButtons.length ? <nav className="actions gray">{actionsButtons}</nav> : null}
            {children}
        </div>);
    }
}
