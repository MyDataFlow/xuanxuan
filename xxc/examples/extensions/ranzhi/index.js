const injectCss = ``;
const isWindows7 = window.navigator.userAgent.includes('Windows NT 6.');

let extension = null;
let testUrlEntryID = null;

module.exports = {
    onAttach: ext => {
        extension = ext;
        if (extension.entryUrl) {
            extension.serverEntryHost = new URL(extension.entryUrl).host;
        }
    },
    urlInspectors: [{
        // test 函数用于判断一个url是否要进行特殊卡片渲染
        test: url => {
            testUrlEntryID = null;
            if (extension.serverData) {
                return extension.serverData.find(item => {
                    if (url.startsWith(item.url)) {
                        testUrlEntryID = item.id;
                        return true;
                    }
                });
            }
        },
        // getURL 用于转换实际使用的地址
        getUrl: url => {
            // 在这里即可以直接使用 extension.getEntryUrl(url) 走 entry/visit， 也可以自己进行其他处理（如果不需要验证，直接返回 url）。
            return extension.getEntryUrl(url, testUrlEntryID);
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
                originSrc: url.includes('?') ? `${url}&display=app` : `${url}?display=app`,
                // insertCSS 用于将 css 注入到 iframe 页面内，用于改变源页面外观
                insertCss: injectCss,
                // url iframe 地址
                src: url.includes('?') ? `${url}&display=card` : `${url}?display=card`,
                // iframe 高度和宽度设置
                style: {height: '400px', width: '550px'},
                // type 为 iframe 和 webview 方式则直接在卡片内加载页面
                type: isWindows7 ? 'iframe' : 'webview'
            };
            return cardMeta;
        }
    }]
};
