import React, {Component, PropTypes} from 'react';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import replaceViews from '../replace-views';
import Button from '../../components/button';
import Icon from '../../components/icon';

export default class MessageContentCard extends Component {
    static propTypes = {
        className: PropTypes.string,
        card: PropTypes.object.isRequired,
    };

    static defaultProps = {
        className: 'layer rounded shadow-2',
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
            ...other
        } = this.props;

        const {image, title, subtitle, content, icon, actions, url} = card;
        const imageView = React.isValidElement(image) ? image : <img alt="" src={image} />;
        const titleView = React.isValidElement(title) ? title : <h4>{title}</h4>;
        const subTitleView = React.isValidElement(subtitle) ? subtitle : <h5>{subtitle}</h5>;
        const iconView = Icon.render(icon);
        const contentView = content ? <div className="card-content">{content}</div> : null;
        const actionsButtons = [];
        if (actions) {
            actions.forEach((action, idx) => {
                actionsButtons.push(<Button btnClass={action.btnClass || ''} key={idx} label={action.label} icon={action.icon} onClick={this.handleActionButtonClick.bind(this, action)} />);
            });
        }

        return (<div
            className={classes('app-message-card', className, {'app-link state': !!url})}
            data-url={url}
            {...other}
        >
            <header>
                {imageView}
                {iconView}
                <hgroup>
                    {titleView}
                    {subTitleView}
                </hgroup>
            </header>
            {contentView}
            {actionsButtons && actionsButtons.length ? <nav className="actions nav gray">{actionsButtons}</nav> : null}
        </div>);
    }
}
