import React, {PureComponent, PropTypes} from 'react';
import {classes} from '../../utils/html-helper';
import replaceViews from '../replace-views';
import MessageContentCard from './message-content-card';
import {getUrlMeta} from '../../core/ui';

export default class MessageContentUrl extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        url: PropTypes.string.isRequired,
        data: PropTypes.object
    };

    static defaultProps = {
        className: null,
        data: null
    };

    static get MessageContentUrl() {
        return replaceViews('chats/message-content-url', MessageContentUrl);
    }

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

    componentDidUpdate() {
        this.getUrlMeta();
    }
    
    getUrlMeta() {
        if (this.state.meta) {
            return;
        }
        const {url} = this.props;
        getUrlMeta(url).then(meta => {
            return this.setState({meta});
        }).catch(_ => {
            return this.setState({meta: {url, title: url}});
        });
    }

    render() {
        let {
            url,
            className,
            data,
            ...other
        } = this.props;

        const {meta} = this.state;
        const card = Object.assign({
            title: url,
        }, meta, {
            icon: meta ? (meta.icon || 'mdi-web icon-2x text-info') : 'mdi-loading muted spin',
            url: null
        });

        return <MessageContentCard card={card} className={classes('app-message-content-url relative')} {...other}><a  className="dock" href={url} title={card.title} /></MessageContentCard>;
    }
}
