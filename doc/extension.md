# 扩展

喧喧的扩展机制依赖 nodejs，所以目前仅支持 Electron 或 nwjs 上的扩展。

## 扩展类型

* `plugin`: 插件，扩展喧喧现有的功能；
* `app`：应用，提供完整界面或窗口对应用；
* `theme`：主题，提供额外对界面风格。

## 扩展描述文件 package.json

```json
{
    // 扩展的名称，扩展名称只能包含字母、数字、短横线及下划线，且第一个字符必须为字母
    "name": "simple-extension", 

    // 扩展在界面上显示的名称
    "displayName": "简单扩展",

    // 扩展的描述或介绍文本
    "description": "这是一个简单扩展的例子。",

    // 扩展配置
    "xxext": {

        // 扩展类型，目前支持的类型包括：
        //   * app    -  应用扩展
        //   * plugin -  插件扩展
        //   * theme  -  主题扩展
        "type": "app",

        // 扩展图标，可以使用如下值
        //   * 使用 Material Design Icons (https://materialdesignicons.com/)，使用 mdi- 前缀，例如 mdi-star
        //   * 使用 http:// 或 https:// 协议开头页面地址，例如 http://zui.sexy/img/icon.png
        //   * 使用相对扩展包目录的相对地址，例如 img/icon.png
        // 如果不指定则会使用扩展图标
        "icon": "mdi-star",

        // 扩展显示颜色，可能被用到自动生成的图标上或作为部分界面背景
        "accentColor": "#aa00ff",

        // 针对扩展类型 app - 应用界面类型
        // 可选值包括：
        //   * insideView：提供 React component 作为视图
        //   * webView：完整的网页视图
        "appType": "insideView",

        // 当 appType 为 webView 时加载的页面地址，可以包含以下格式的地址：
        //   * 使用 http:// 或 https:// 协议开头的网站页面地址，例如 http://zui.sexy/m
        //   * 使用相对扩展包目录的相对地址，通常指向一个 html 文件，例如 lib/page/index.html
        "webViewUrl": "http://zui.sexy/m",

        // 针对扩展类型 app - 应用图标，可以使用如下值
        //   * 使用 Material Design Icons (https://materialdesignicons.com/)，使用 mdi- 前缀，例如 mdi-star
        //   * 使用 http:// 或 https:// 协议开头页面地址，例如 http://zui.sexy/img/icon.png
        //   * 使用相对扩展包目录的相对地址，例如 img/icon.png
        // 如果不指定则会使用扩展图标
        "appIcon": "mdi-star",

        // 针对扩展类型 app - 应用配色，可能被用到图标上，如果不指定会使用扩展的 accentColor
        "appAccentColor": "#aa00ff",

        // 针对扩展类型 app - 界面背景色，可以设置为透明（transparent），默认为白色 #fff
        "appBackColor": "#fff",

        // 针对扩展类型 app - 应用子界面，允许在独立的窗口或标签页中打开
        "appPages": {

            // pageName 为对应的子界面名称，名称只能包含字母、数字、短横线及下划线
            "pageName": {

                // 子界面图标，图标可取值与 appIcon 相同
                "icon": "mdi-flag",

                // 子界面配色
                "accentColor": "#aa00ff",

                // 子界面背景色
                "backColor": "#fff",
            },

            // ... 更多子界面配置
        },

        // 针对扩展类型 plugin 或 app - 应用主要入口脚本文件位置，可以包含以下格式的地址：
        //   * 使用相对扩展包目录的相对地址，例如 lib/index.js
        "main": "lib/index.js",

        // 针对扩展类型 theme - 主题列表
        // 通过一个对象数组，声明多个主题配置
        "themes": [
            {
                // 主题内部名称
                "name": "dark",

                // 主题显示名称
                "displayName": "暗色",

                // 主题 CSS 文件位置，可以是相对包的路径或者一个可访问的网址
                "style": "lib/themes/dark.css",

                // 主题载入方式，可取值包括：
                //   * append   在默认样式的基础上附加样式
                //   * override 替代默认样式
                "inject": "override",

                // 主题的预览图片地址
                "preview": "lib/themes/preview-dark.png"
            }
        ],

        // 扩展配置
        "configurations": [
            {
                // 配置项名称
                "name": "cfg1", 

                // 配置项显示名称
                "displayName": "配置项一",

                // 配置项描述
                "description": "配置项一的说明",

                // 配置项默认值
                "defaultValue": "默认值",

                // 配置项值类型，可选值包括
                "valueType": "string",

                // 用于验证配置值是否合法的正则表达式
                "matchReg": "[a-zA-Z0-9]+", 
            }
        ],

        // 是否在使用的时候才加载主模块
        "lazy": true
    },

    // 扩展的版本
    "version": "1.0.0",

    // 扩展开发的作者
    "author": "Catouse",

    // 扩展的发布者
    "publisher": "cnezsoft.com",

    // 扩展要求的运行环境
    "engines": {

        // 扩展对喧喧版本的支持
        "xuanxuan": "^1.3.0",

        // 扩展所支持的平台
        "platform": "electron,nwjs",

        // 扩展所依赖的其他扩展
        "extensions": [],
    },

    // 扩展版权声明
    "license": "MIT",

    // 扩展主页
    "homepage": "http://xuan.im/extensions",

    // 扩展关键字，可以用于搜索
    "keywords": ["xuanxuan", "im", "extension", "sample"],

    // ...兼容其他 npm package.json 属性
}
```

## 扩展包目录结构

```
[+] extension-dir/
    - package.json    描述文件（必须）
    - icon.png        扩展图标文件 (必须)
    - README.md       说明文件 （不是必须，但推荐）
    - index.js        扩展主入口文件（当扩展类型为插件时必须提供）
    - theme.css       扩展主题样式表（当扩展类型为主题时必须提供）
    ... 其他文件目录
```

扩展主入口文件可以在 package.json->xxext.main 中指定。

## 扩展主入口模块

扩展主入口文件为一个 JavaScript 模块，当喧喧加载完毕时会逐个加载扩展的主入口模块。在扩展主入口模块中可以访问全局扩展对象 `global.xxext`。扩展主入口模块应该返回一个对象，该对象可以包含如下生命周期函数：

<table>
  <thead>
    <tr>
      <td>函数</td>
      <td>说明</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>onAttach(ext)</code></td>
      <td>当扩展被加载后调用，此时可以对扩展进行初始化</td>
    </tr>
    <tr>
      <td><code>onDetach(ext)</code></td>
      <td>当扩展被卸载时调用，此时应该将扩展使用的资源进行释放，例如销毁定时器等</td>
    </tr>
    <tr>
      <td><code>onUserLogin(user, error)</code></td>
      <td>当用户登录完成时调用；</td>
    </tr>
    <tr>
      <td><code>onUserLoginout(user)</code></td>
      <td>当当前登录的退出登录时调用</td>
    </tr>
    <tr>
      <td><code>onUserStatusChange(status, oldStatus, user)</code></td>
      <td>当用户状态发生变化时调用</td>
    </tr>
    <tr>
      <td><code>onSendChatMessages(messages, chat, user)</code></td>
      <td>当用户发送聊天消息时调用</td>
    </tr>
    <tr>
      <td><code>onReceiveChatMessages(messages, user)</code></td>
      <td>当用户接收到聊天消息时调用</td>
    </tr>
    <tr>
      <td><code>MainView</code></td>
      <td>当作为内嵌应用时的 React 实现的界面主组件</td>
    </tr>
  </tbody>
</table>

下面为一个简单等扩展模块示例：

```js
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
            alert('扩展加载完成已经 10 秒钟了，刚刚加载等扩展名称是：' + ext.displayName);
        });
    },

    onDetach: (ext) => {
        // 扩展将被卸载，此时应该清理计时器
        clearTimeout(timerTask);
        timerTask = null;
    },

    onUserLogin: (user, error) => {
        // 当用户登录时在此处可以进行相关操作，下面以显示当前登录等结果和用户名为例
        if (user && !error) { // 表示登录成功
            components.Modal.alert('用户登录成功了，用户名称是：' + user.displayName);
        } else {
            components.Modal.alert('用户登录失败了。');
        }
    },
}
```

## 全局扩展对象

在扩展主入口模块或新开 WebView 窗口中都可以访问全局扩展对象 `global.Xext`，全局扩展对象包含了喧喧所有内置的关键模块，主要包括如下内容：

<table>
  <thead>
    <tr>
      <td>模块</td>
      <td>说明</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>lang</code></td>
      <td>语言操作模块</td>
    </tr>
    <tr>
      <td><code>app</code></td>
      <td>喧喧应用实例对象</td>
    </tr>
    <tr>
      <td><code>components</code></td>
      <td>通用 React 组件</td>
    </tr>
    <tr>
      <td><code>utils</code></td>
      <td>通用工具模块</td>
    </tr>
    <tr>
      <td><code>platform</code></td>
      <td>平台相关模块</td>
    </tr>
    <tr>
      <td><code>views</code></td>
      <td>喧喧界面视图 React 组件</td>
    </tr>
  </tbody>
</table>
