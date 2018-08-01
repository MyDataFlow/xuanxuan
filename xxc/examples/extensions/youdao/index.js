// 从全局扩展对象中引入模块
const {
    utils,
    nodeModules
} = global.Xext;

const injectCSS = '.fanyi__nav,.download__area,.inside__products,.fanyi__footer,.side__nav{display: none!important}body{padding: 20px 0!important}.fanyi__operations,.fanyi__input{margin-left: 20px!important;margin-right:20px!important}';

module.exports = {
    onAttach: ext => {
    },
    onDetach: ext => {
    },
    urlInspectors: [{
        test: (/^https?:\/\/(fanyi\.youdao\.com)\/\w*/i),
        open: (url) => {
            return `!openUrlInDialog/${encodeURIComponent(url)}/?width=980px&height=400px&insertCss=${encodeURIComponent(injectCSS)}`;
        }
    }],
    contextMenuCreators: [{
        match: 'message.text',
        create: context => {
            const {message} = context;
            const contentElement = document.getElementById(`message-content-${message.gid}`);
            const messageContent = contentElement ? contentElement.innerText : message.content;
            const injectForm = {'#inputOriginal': messageContent, $input: '#inputOriginal'};
            return [{
                icon: 'mdi-translate',
                label: '翻译消息',
                url: `!openUrlInDialog/${encodeURIComponent('http://fanyi.youdao.com/')}/?width=980px&height=400px&insertCss=${encodeURIComponent(injectCSS)}&injectForm=${encodeURIComponent(JSON.stringify(injectForm))}`
            }];
        }
    }]
};
