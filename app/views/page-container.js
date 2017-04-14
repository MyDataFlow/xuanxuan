import React               from 'react';
import Theme               from '../theme';
import {App, Lang, Config} from '../app';
import ChatPage            from './chat/page';
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
        [R.ui.navbar_chat]     : {component: ChatPage, page: R.ui.navbar_chat, online: true},
        [R.ui.navbar_contacts] : {page: R.ui.navbar_chat},
        [R.ui.navbar_groups]   : {page: R.ui.navbar_chat}
    },

    getInitialState() {
        return {
            page: this.pages[App.user.config.ui.navbar.page].page ? this.pages[App.user.config.ui.navbar.page].page : R.ui.navbar_chat
        };
    },

    componentDidMount() {
        this._handleUIChangeEvent = App.on(R.event.ui_change, e => {
            if(e.navbar !== this.state.page) {
                this.setState({page: e.navbar});
                App.user.config.ui.navbar.page = e.navbar;
                App.delaySaveUser();
            }
        });
    },

    componentWillUnmount() {
        App.off(this._handleUIChangeEvent);
    },

    getDisplayCacheContentId(cacheName) {
        let pageConfig = this.pages[this.state.page];
        return pageConfig.page ? pageConfig.page : this.state.page;
    },

    renderCacheContent(contentId, cacheName) {
        let pageConfig = this.pages[contentId];
        if(pageConfig) {
            if(pageConfig.component) {
                if(pageConfig.online && App.user.isUnverified) {
                    return <ContentNotReady className="page dock-full" title={'你需要登录验证后才能使用完整功能。'} />;;
                }
                let PageComponent = pageConfig.component;
                return <PageComponent className="page dock-full"/>;
            }
            if(pageConfig.page) {
                return this.renderCacheContent(pageConfig.page, cacheName);
            }
        }
        return <ContentNotReady className="page dock-full" title={'【' + contentId + '】 的内容尚未准备就绪。'} />;
    },

    render() {
        return (
          <div {...this.props} 
            className="page-container dock-full"
            style={{left: 50}}>
            {this.renderCacheContents()}
          </div>
        );
    }
});

export default PageContianer;
