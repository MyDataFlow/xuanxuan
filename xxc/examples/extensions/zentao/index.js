const {
    nodeModules
} = global.Xext;

const $ = nodeModules.jquery;

const ACTION_ICONS = {
    完成: 'mdi-check-circle',
    取消: 'mdi-cancel',
    工时: 'mdi-clock-outline',
    日志: 'mdi-clock-outline',
    指派: 'mdi-hand-pointing-right',
    执行: 'mdi-play-box-outline',
    结果: 'mdi-playlist-play',
    开始: 'mdi-play-box-outline',
    暂停: 'mdi-pause',
};
const injectCss = `#header,#footer,#titlebar,#mainMenu>.btn-toolbar>a:first-child,#mainMenu>.btn-toolbar>a:first-child+.divider{display:none!important}
body,#wrap{padding:0!important}
#header,#header+#main{min-width:400px!important}
#mainActions .btn-toolbar{top:-50px!important}
#main{padding:10px 0!important;}
.outer{padding:10px 10px 40px!important;box-shadow:none!important;border:none!important;}
.col-main>.main>.actions{position:fixed!important;bottom:0!important;text-align:center!important;left:0!important;right:0!important;background:#fff!important;margin:0!important;padding:5px!important;background:#f1f1f1 !important}.col-main>.main>.actions>.btn-group:last-child,#mainMenu{display:none!important}#main>.container{padding: 0 10px!important}
@media(max-width: 650px){
.outer>.row-table,#mainContent.main-row{display:block!important}
.outer>.row-table>.col-main,.outer>.row-table>.col-side,#mainContent.main-row>.main-col,#mainContent.main-row>.side-col{display:block!important;padding:0!important;max-width:initial!important;width:100%!important}
}`;

let extension = null;

const getAuthUrl = (url) => {
    // const auth = extension.auth;
    // if (auth) {
    //     if (url) {
    //         return auth.includes('?') ? `${auth}&refer=${encodeURIComponent(url)}` : `${auth}?refer=${encodeURIComponent(url)}`;
    //     }
    //     return auth;
    // }
    return url;
};

module.exports = {
    onAttach: ext => {
        extension = ext;
        if (extension.auth) {
            const authUrl = new URL(extension.auth);
            authUrl.search = '';
            extension._pkg.auth = authUrl.toString();
        }
        if (extension.serverEntry) {
            extension.serverEntryHost = new URL(extension.serverEntry).host;
        }
    },
    // onDetach: ext => {
    // },
    urlInspectors: [{
        test: url => {
            const urlHost = new URL(url).host;
            return [extension.serverEntryHost, '.5upm.com', 'pms.zentao.net', 'demo.zentao.net', 'pro.demo.zentao.net', '.zentaopm.com', 'test.zentao.net'].some(x => urlHost.endsWith(x));
        },
        getUrl: getAuthUrl,
        inspect: (meta, cardMeta, url) => {
            if (meta.document.length < 300 && (meta.document.includes('deny') || meta.document.includes('?m=user&f=login') || meta.document.includes('user-login'))) {
                cardMeta.title = url;
                cardMeta.subtitle = '无法获取内容，需要进行登录验证';
                cardMeta.actions = [{
                    url: `!openUrlInDialog/${encodeURIComponent(url)}/?size=lg&insertCss=${encodeURIComponent(injectCss)}`,
                    label: '登录查看',
                    icon: 'mdi-open-in-new'
                }];
                console.log('Get zentao meta error', meta);
                return cardMeta;
            }
            const object = {};
            if (meta.title.startsWith('TASK#') || meta.title.startsWith('TASK #')) {
                object.type = 'task';
            } else if (meta.title.startsWith('STORY #')) {
                object.type = 'story';
            } else if (meta.title.startsWith('BUG #')) {
                object.type = 'bug';
            } else if (meta.title.startsWith('CASE #')) {
                object.type = 'case';
            } else if (meta.title.startsWith('DOC #')) {
                object.type = 'doc';
            }
            cardMeta.object = object;
            // const isClassicZentao = !!$doc.find('.outer').length;
            if (object.type) {
                const $doc = $(meta.document);
                object.title = $doc.find('#mainMenu .page-title>.text,#titlebar>.heading>strong').text().trim();
                object.id = $doc.find('#titlebar>.heading>.prefix>strong,#mainMenu .page-title>.label-id').text().trim();
                cardMeta.subtitle = `${object.type.toUpperCase()} #${object.id} ${url}`;
                cardMeta.webviewContent = true;
                cardMeta.content = {
                    insertCss: injectCss,
                    src: getAuthUrl(url),
                    style: {height: '400px', width: '550px'}
                };
                cardMeta.title = object.title;
            } else {
                cardMeta.title = meta.title;
                if (cardMeta.title.endsWith(' - 禅道')) {
                    cardMeta.title = cardMeta.title.substring(0, cardMeta.title.length - 5);
                }
            }
            return cardMeta;
        }
    }]
};
