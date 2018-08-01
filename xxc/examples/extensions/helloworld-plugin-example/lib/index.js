// 从全局扩展对象中引入模块
const {
    app,
    components,
    utils
} = global.Xext;

// 用于存储计时器标志
let timerTask = null;

module.exports = {
    onAttach: (ext) => {
        console.log('>> 扩展【helloworld-plugin-example】：扩展加载完成，刚刚加载等扩展名称是：' + ext.displayName);
    },

    onReady: (ext) => {
        console.log('>> 扩展【helloworld-plugin-example】：界面已准备就绪。', ext.displayName);
    },

    onDetach: (ext) => {
        // 扩展将被卸载，此时应该清理计时器
        clearTimeout(timerTask);
        timerTask = null;
        console.log('>> 扩展【helloworld-plugin-example】：扩展已卸载。', ext.displayName);
    },

    onUserLogin: (user, error) => {
        // 当用户登录时在此处可以进行相关操作，下面以显示当前登录等结果和用户名为例
        if (user && !error) { // 表示登录成功
            console.log('>> 扩展【helloworld-plugin-example】：用户登录成功了，用户名称是：' + user.displayName);
        }
    },

    onUserLoginout: (user) => {
        if (user) {
            console.log('>> 扩展【helloworld-plugin-example】：用户退出登录了，用户名称是：' + user.displayName);
        }
    },

    onUserStatusChange: (status, oldStatus, user) => {
        console.log('>> 扩展【helloworld-plugin-example】：用户状态发生变化了', {status, oldStatus, user});
    },

    onSendChatMessages: (messages, chat, user) => {
        console.log('>> 扩展【helloworld-plugin-example】：用户发送了消息', {messages, chat, user});

        // 在每条文本消息末尾加上个性签名
        // messages.forEach(message => {
        //     if (message.contentType === 'text') {
        //         message.content = `${message.content} -- 来自插件示例`;
        //     }
        // });
    },

    onReceiveChatMessages: (messages, user) => {
        console.log('>> 扩展【helloworld-plugin-example】：用户收到了消息', {messages, user});
    },

    commands: {
        saveText: (context, ...params) => {
            console.log('保存文本成功');
            return 'ok';
        }
    },

    contextMenuCreators: [{
        match: 'message.text',
        items: [{
            icon: 'mdi-emoticon-cool',
            label: 'say hello',
            click: () => {
                alert('hello');
            }
        }, {
            icon: 'mdi-earth',
            label: '访问禅道',
            url: 'http://zentao.net'
        }]
    }, {
        match: 'chat.sendbox.toolbar',
        create: context => {
            return [{
                label: 'say hello',
                click: () => {
                    context.sendContent('Hello!');
                }
            }];
        }
    }]
};
