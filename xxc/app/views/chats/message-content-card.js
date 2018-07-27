import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {classes} from '../../utils/html-helper';
import App from '../../core';
import replaceViews from '../replace-views';
import Button from '../../components/button';
import Avatar from '../../components/avatar';
import StringHelper from '../../utils/string-helper';
import Lang from '../../lang';
import WebView from '../common/webview';

const handleActionButtonClick = (action, e) => {
    if (action.url && App.ui.openUrl(action.url, e.target)) {
        e.stopPropagation();
    } else if (action.click) {
        action.click(e);
        e.stopPropagation();
    }
};

const handleMenuIconClick = (menuItem, e) => {
    if (menuItem.click) {
        menuItem.click(e);
        e.stopPropagation();
    }
};

export default class MessageContentCard extends Component {
    static get MessageContentCard() {
        return replaceViews('chats/message-content-card', MessageContentCard);
    }

    static propTypes = {
        baseClassName: PropTypes.string,
        card: PropTypes.object.isRequired,
        className: PropTypes.string,
        header: PropTypes.any,
        children: PropTypes.any,
        style: PropTypes.object,
    };

    static defaultProps = {
        baseClassName: 'layer rounded shadow-2',
        className: '',
        header: null,
        style: null,
        children: null,
    };

    render() {
        const {
            card,
            className,
            baseClassName,
            header,
            children,
            style,
            ...other
        } = this.props;

        const {image, title, subtitle, content, icon, actions, url, htmlContent, webviewContent, contentType, contentUrl, originContentType, menu, provider, clickable} = card;
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
            } else if (webviewContent) {
                contentView = <WebView className="relative" {...content} />;
            } else if (htmlContent) {
                contentView = <div className="content" dangerouslySetInnerHTML={{__html: content}} />;
            } else {
                contentView = <div className="content">{content}</div>;
            }
        }

        const actionsButtons = [];
        if (actions) {
            actions.forEach((action, idx) => {
                actionsButtons.push(<Button className={action.btnClass || 'rounded primary outline'} key={idx} label={action.label} icon={action.icon} onClick={handleActionButtonClick.bind(this, action)} />);
            });
        }

        const cardsMenu = [];
        if (menu && menu.length) {
            menu.forEach((menuItem, menuItemIndex) => {
                cardsMenu.push(<div key={menuItemIndex} className="hint--top-left" data-hint={menuItem.label}><a className="btn rounded iconbutton" onClick={menuItem.click ? handleMenuIconClick.bind(this, menuItem) : null} href={menuItem.url}><Avatar auto={menuItem.icon} className="avatar-sm" /></a></div>);
            });
        }
        if (provider) {
            cardsMenu.push(<div key="provider" className="hint--top-left" data-hint={Lang.format('chat.message.provider.format', provider.label || provider.name)}><a className="btn rounded iconbutton" onClick={provider.click} href={provider.url}><Avatar auto={provider.icon} className="avatar-sm" /></a></div>);
        }

        const clickView = (clickable && clickable !== true) ? <a className="dock" href={url || contentUrl} title={titleView ? title : null} /> : null;
        return (<div
            className={classes('app-message-card', baseClassName, className, {
                'app-link state': clickable === true,
                'with-avatar': !!avatarView,
                'only-title': !contentView && !subTitleView && !actionsButtons.length
            })}
            data-url={url}
            style={Object.assign({}, style, card.style)}
            {...other}
        >
            {topView}
            {(header || titleView || avatarView || subTitleView) ? <header>
                {avatarView}
                <hgroup>
                    {titleView}
                    {subTitleView}
                    {clickable === 'title' ? clickView : null}
                </hgroup>
                {header}
                {clickable === 'header' ? clickView : null}
            </header> : null}
            {contentView}
            {clickable === 'content' ? clickView : null}
            {actionsButtons && actionsButtons.length ? <nav className="nav actions gray">{actionsButtons}</nav> : null}
            {children}
            {cardsMenu && cardsMenu.length ? <div className="app-menu-card-menu">{cardsMenu}</div> : null}
        </div>);
    }
}
