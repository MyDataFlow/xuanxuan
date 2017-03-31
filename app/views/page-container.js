import React               from 'react';
import Theme               from '../theme';
import {App, Lang, Config} from '../app';
import ChatPage            from './chat/page';
import AppsPage            from './apps/page';
import ContactsPage        from './contacts/contacts';
import CacheContents       from './mixins/cache-contents';
import ContentNotReady     from './misc/content-not-ready';
import R                   from '../resource';

/*
 * Page container react component class
 */
const PageContianer = React.createClass({
    mixins: [CacheContents],
    pages: {
        chat:      {component: ChatPage},
        contacts:  {component: ContactsPage},
        groups:    {component: ContentNotReady}
    },

    getInitialState() {
        return {
            position: {left: App.user.config.ui.navbar.compactWidth},
            page: App.user.config.ui.navbar.page || 'chat'
        };
    },

    componentDidMount() {
        this._handleUIChangeEvent = App.on(R.event.ui_change, e => {
            if(e.navbar !== this.state.page) {
                this.setState({page: e.navbar});
            }
        });
    },

    componentWillUnmount() {
        App.off(this._handleUIChangeEvent);
    },

    getDisplayCacheContentId(cacheName) {
        return this.state.page;
    },

    renderCacheContent(contentId, cacheName) {
        console.info('renderCacheContent', contentId, cacheName);
        let PageComponent = this.pages[contentId].component;
        let options = contentId === 'chat' ? null : {title: '【' + contentId + '】 的内容尚未准备就绪。'};
        return <PageComponent className="page dock-full" {...options}/>;
    },

    render() {
        const STYLE = {
            container: {transition: Theme.transition.normal('left', 'right')},
        };

        let pageStyle = Object.assign({}, STYLE.container, this.state.position);

        return (
          <div {...this.props} 
            className="page-container dock-full"
            style={pageStyle}>
            {this.renderCacheContents()}
          </div>
        );
    }
});

export default PageContianer;
