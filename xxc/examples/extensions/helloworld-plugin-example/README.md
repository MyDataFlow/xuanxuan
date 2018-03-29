# 示例插件

此扩展演示喧喧插件机制。

目录结构如下：

```
[+] helloworld-plugin-example/
    - package.json
    - README.md
    [+] lib/
        - index.js
```

主要代码如下：

```helloworld-plugin-example/lib/index.js
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
        // 扩展加载完毕了, 此时设置一个计时器，在加载完成 10 秒中之后在界面上显示一个消息
        timerTask = setTimeout(() => {
            console.log('扩展加载完成已经 5 秒钟了，刚刚加载等扩展名称是：' + ext.displayName);
        }, 5000);
    },

    onDetach: (ext) => {
        // 扩展将被卸载，此时应该清理计时器
        clearTimeout(timerTask);
        timerTask = null;
    },

    onUserLogin: (user, error) => {
        // 当用户登录时在此处可以进行相关操作，下面以显示当前登录等结果和用户名为例
        if (user && !error) { // 表示登录成功
            console.log('用户登录成功了，用户名称是：' + user.displayName);
        }
    },

    onUserLoginout: (user) => {
        if (user) {
            console.log('用户退出登录了，用户名称是：' + user.displayName);
        }
    },

    onUserStatusChange: (status, oldStatus, user) => {
        console.log('用户状态发生变化了', {status, oldStatus, user});
    },

    onSendChatMessages: (messages, chat, user) => {
        console.log('用户发送了消息', {messages, chat, user});
    },

    onReceiveChatMessages: (messages, user) => {
        console.log('用户收到了消息', {messages, user});
    },
};

```
