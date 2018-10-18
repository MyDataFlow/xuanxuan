const injectCss = `#header,#footer,#mainMenu>.btn-toolbar>a:first-child,#mainMenu>.btn-toolbar>a:first-child+.divider{display:none!important}
body,#wrap{padding:0!important}
#header,#header+#main{min-width:400px!important}
#mainActions .btn-toolbar{top:-50px!important}
#main{padding:10px 0!important;}
.outer{padding:10px 10px 40px!important;box-shadow:none!important;border:none!important;}
.col-main>.main>.actions{position:fixed!important;bottom:0!important;text-align:center!important;left:0!important;right:0!important;background:#fff!important;margin:0!important;padding:5px!important;background:#f1f1f1 !important}.col-main>.main>.actions>.btn-group:last-child{display:none!important}#main>.container{padding: 0 10px!important}
@media(max-width: 650px){
.outer>.row-table,#mainContent.main-row{display:block!important}
.outer>.row-table>.col-main,.outer>.row-table>.col-side,#mainContent.main-row>.main-col,#mainContent.main-row>.side-col{display:block!important;padding:0!important;max-width:initial!important;width:100%!important}
#mainContent.main-row>.main-col{margin-bottom:10px!important;}
}`;
const isWindows7 = window.navigator.userAgent.includes('Windows NT 6.');

let extension = null;

module.exports = {
    onAttach: ext => {
        extension = ext;
    },
    // onDetach: ext => {
    // },
    urlInspectors: [{
        // test 函数用于判断一个url是否要进行特殊卡片渲染
        test: url => {
            const urlObj = new URL(url)
            const urlHost = urlObj.host;
            return ['.5upm.com', 'pms.zentao.net', 'demo.zentao.net', 'pro.demo.zentao.net', '.zentaopm.com', 'test.zentao.net'].some(x => urlHost.endsWith(x));
        },
        // getURL 用于转换实际使用的地址
        getUrl: url => {
            // 在这里即可以直接使用 extension.getEntryUrl(url) 走 entry/visit， 也可以自己进行其他处理（如果不需要验证，直接返回 url）。
            return extension.getEntryUrl(url);
        },
        // noMeta=true 用于忽略系统内置的方式
        noMeta: true,
        // 用于决定最终url渲染的卡片配置
        inspect: (url) => {
            const cardMeta = {};
            cardMeta.title = null;
            cardMeta.webviewContent = true;
            cardMeta.icon = false;
            cardMeta.content = {
                // insertCSS 用于将 css 注入到 iframe 页面内，用于改变源页面外观
                insertCss: injectCss,
                // url iframe 地址
                src: url,
                // iframe 高度和宽度设置
                style: {height: '400px', width: '550px'},
                // type 为 iframe 和 webview 方式则直接在卡片内加载页面
                type: isWindows7 ? 'iframe' : 'webview'
            };
            return cardMeta;
        }
    }]
};
