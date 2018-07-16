import React, {PureComponent, PropTypes} from 'react';
import {classes} from '../../utils/html-helper';
import replaceViews from '../replace-views';
import MessageContentCard from './message-content-card';
import {getUrlMeta} from '../../core/ui';
import WebView from '../common/webview';
import Lang from '../../lang';

export default class MessageContentUrl extends PureComponent {
    static get MessageContentUrl() {
        return replaceViews('chats/message-content-url', MessageContentUrl);
    }

    static propTypes = {
        className: PropTypes.string,
        url: PropTypes.string.isRequired,
        data: PropTypes.object
    };

    static defaultProps = {
        className: null,
        data: null
    };

    constructor(props) {
        super(props);
        const {data} = props;
        this.state = {meta: data && data.title ? data : null};
    }

    componentDidMount() {
        this.getUrlMeta();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.url !== this.props.url) {
            this.setState({meta: null});
        }
    }

    getUrlMeta() {
        if (this.state.meta && !this.state.loading) {
            return;
        }
        const {url} = this.props;
        getUrlMeta(url).then(meta => {
            return this.setState({meta, loading: false});
        }).catch(_ => {
            if (DEBUG) {
                console.error('Get url meta error', _);
            }
            return this.setState({meta: {url, title: url}, loading: false});
        });
    }

    tryGetUrlMeta() {
        this.setState({loading: true}, () => {
            this.getUrlMeta();
        });
    }

    render() {
        const {
            url,
            className,
            data,
            ...other
        } = this.props;

        const {meta, loading} = this.state;
        const card = Object.assign({
            clickable: 'content',
            title: url,
        }, meta, {
            icon: (meta && !loading) ? (meta.icon || 'mdi-web icon-2x text-info') : 'mdi-loading muted spin',
        });

        if (meta && !loading) {
            if (!card.menu) {
                card.menu = [];
            }
            const {webviewContent, content} = card;
            if (webviewContent) {
                card.content = <WebView className="relative" {...content} ref={e => {this.webview = e;}} />;
                card.clickable = 'header';
                card.menu.push({
                    label: Lang.string('ext.app.open'),
                    url: `!openUrlInDialog/${encodeURIComponent(content.src)}/?size=lg&insertCss=${encodeURIComponent(content.insertCss)}`,
                    icon: 'mdi-open-in-app'
                });
            }
            card.menu.push({
                label: Lang.string('chat.message.refreshCard'),
                click: () => {
                    if (this.webview) {
                        this.webview.reloadWebview();
                    } else {
                        this.tryGetUrlMeta();
                    }
                },
                icon: 'mdi-refresh'
            });
        }

        return <MessageContentCard card={card} className={classes('app-message-content-url relative')} {...other} />;
    }
}
