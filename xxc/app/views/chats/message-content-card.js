import React, {Component, PropTypes} from 'react';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import replaceViews from '../replace-views';
import Button from '../../components/button';
import Avatar from '../../components/avatar';
import StringHelper from '../../utils/string-helper';

export default class MessageContentCard extends Component {
    static propTypes = {
        baseClassName: PropTypes.string,
        card: PropTypes.object.isRequired,
        className: PropTypes.string,
        header: PropTypes.any,
    };

    static defaultProps = {
        baseClassName: 'layer rounded shadow-2',
        className: '',
        header: null
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
        const {
            card,
            className,
            baseClassName,
            header,
            children,
            ...other
        } = this.props;

        const {image, title, subtitle, content, icon, actions, url, htmlContent, contentType, contentUrl, originContentType, objectType} = card;
        let topView = null;
        if (contentUrl) {
            if (contentType === 'image') {
                topView = <img src={contentUrl} alt={contentUrl} />;
            } else if (contentType === 'video') {
                topView = (<video controls>
                    <source src={contentUrl} type={originContentType} />
                </video>);
            }
        }
        if (!topView && image) {
            topView = React.isValidElement(image) ? image : <div className="img" style={{backgroundImage: `url(${image})`}} />;
        }

        const titleView = title ? (React.isValidElement(title) ? title : <h4>{title}</h4>) : null;
        const subTitleView = subtitle ? (React.isValidElement(subtitle) ? subtitle : <h5>{subtitle}</h5>) : null;
        const avatarView = icon ? Avatar.render(icon) : null;

        let contentView = null;
        if (StringHelper.isNotEmpty(content)) {
            if (React.isValidElement(content)) {
                contentView = content;
            } else if (htmlContent) {
                contentView = <div className="content" dangerouslySetInnerHTML={{__html: content}} />;
            } else {
                contentView = <div className="content">{content}</div>;
            }
        }

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
            {topView}
            <header>
                {avatarView}
                <hgroup>
                    {titleView}
                    {subTitleView}
                </hgroup>
                {header}
            </header>
            {contentView}
            {actionsButtons && actionsButtons.length ? <nav className="actions gray">{actionsButtons}</nav> : null}
            {children}
        </div>);
    }
}
