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
        if (extension.entryUrl) {
            extension.serverEntryHost = new URL(extension.entryUrl).host;
        }
    },
    // onDetach: ext => {
    // },
    urlInspectors: [{
        test: url => {
            const urlHost = new URL(url).host;
            return [extension.serverEntryHost, '.5upm.com', 'pms.zentao.net', 'demo.zentao.net', 'pro.demo.zentao.net', '.zentaopm.com', 'test.zentao.net'].some(x => urlHost.endsWith(x));
        },
        getUrl: url => {
            return extension.getEntryUrl(url);
        },
        noMeta: true,
        inspect: (url) => {
            const cardMeta = {};
            cardMeta.title = null;
            cardMeta.webviewContent = true;
            cardMeta.icon = false;
            cardMeta.content = {
                insertCss: injectCss,
                src: url,
                style: {height: '400px', width: '550px'},
                type: isWindows7 ? 'iframe' : 'webview'
            };
            return cardMeta;
        }
    }]
};
