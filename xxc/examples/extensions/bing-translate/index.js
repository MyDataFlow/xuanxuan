// 从全局扩展对象中引入模块
const {
    utils,
    nodeModules
} = global.Xext;

const $ = nodeModules.jquery;

module.exports = {
    onAttach: ext => {
    },
    onDetach: ext => {
    },
    urlInspectors: [{
        test: (/^https?:\/\/(cn\.bing\.com\/translator)\/\w*/i),
        open: (url) => {
            return `!openUrlInDialog/${encodeURIComponent(url)}/?width=600px&height=${window.innerHeight - 40}px&insertCss=${encodeURIComponent('#theader,.t_navigation,.b_footer{display: none!important}')}`;
        }
    }],
    contextMenuCreators: [{
        match: 'message.text',
        create: context => {
            const {message} = context;
            const contentElement = document.getElementById(`message-content-${message.gid}`);
            const messageContent = contentElement ? contentElement.innerText : message.content;
            const injectForm = {'#t_sv': messageContent, $focus: '#t_sv'};
            return [{
                icon: 'mdi-translate',
                label: '翻译消息',
                url: `!openUrlInDialog/${encodeURIComponent('https://cn.bing.com/translator/')}/?width=600px&height=${window.innerHeight - 40}px&insertCss=${encodeURIComponent('#theader,.t_navigation,.b_footer{display: none!important}')}&injectForm=${encodeURIComponent(JSON.stringify(injectForm))}`
            }];
        }
    }]
};
