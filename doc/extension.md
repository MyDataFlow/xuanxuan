# 扩展

喧喧在 1.3 中提供了最大程度的定制和功能扩展机制，使得开发者非常方便的为喧喧开发新的功能，并且不受官方版本升级的影响，同时也可以利用此机制来实现自己的定制版本。由于扩展是可插拔的，所以用户使用起来非常灵活。喧喧的扩展机制依赖 nodejs，目前仅支持 Electron 上的扩展，浏览器端将不支持扩展机制。

## 扩展机制

### 扩展类型

喧喧支持以下三种类型的扩展来丰富喧喧的功能：

* `plugin`: 插件，扩展喧喧现有的功能；
* `app`：应用，提供将用户自行开发的界面或者网页集成到喧喧中；
* `theme`：主题，提供额外的界面风格供用户切换使用。

![喧喧扩展](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/extensions/app-extensions.png)

### 扩展包目录结构

扩展包为一个使用 zip 压缩的文件，扩展名为 `.zip` 或 `.xext`。当把一个打包后的扩展解压后通常会包含如下的文件结构：

```
[+] extension-dir/
    - package.json    描述文件（必须）
    - icon.png        扩展图标文件 (当使用图片作为图标时必须)
    - README.md       说明文件 （不是必须，但推荐）
    - index.js        扩展主入口文件（当扩展类型为插件时必须提供）
    - theme.css       扩展主题样式表（当扩展类型为主题时必须提供）
    ... 其他在扩展中被引用的文件和目录
```

强烈推荐在扩展包目录内提供一个 `README.md` 文件，此文件内容会在用户查看扩展详情时显示。

![喧喧扩展readme文件](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/extensions/extension-view-readme.png)

### 扩展描述文件 package.json

扩展描述文件是一个扩展必须提供的文件，用来描述一个扩展的名称、类型及其他关键信息的配置文件。喧喧的扩展描述文件文件名为 `package.json`，兼容 npm 包管理器中的 package.json 文件。一个最简单的应用扩展仅需要在扩展包中包含描述文件即可实现。以下为扩展描述文件中支持的配置项目：

```js
{
    // 扩展的名称，扩展名称只能包含字母、数字、短横线及下划线，且第一个字符必须为字母
    // 扩展的名称必须唯一，相同名称的扩展会提示覆盖或升级，为避免与其他扩展发生冲突，也可以使用 guid 做为扩展名称
    "name": "simple-extension", 

    // 扩展在界面上显示的名称
    "displayName": "简单扩展",

    // 扩展的描述或介绍文本
    "description": "这是一个简单扩展的例子。",

    // 扩展配置
    "xext": {
        // 扩展类型，目前支持的类型包括：
        //   * app    -  应用扩展
        //   * plugin -  插件扩展
        //   * theme  -  主题扩展
        "type": "app",

        // 扩展图标，可以使用如下值
        //   * 使用 Material Design Icons (https://materialdesignicons.com/)，使用 mdi- 前缀，例如 mdi-star
        //   * 使用 http:// 或 https:// 协议开头页面地址，例如 http://zui.sexy/img/icon.png
        //   * 使用相对扩展包目录的相对地址，例如 img/icon.png
        // 需要注意：
        //   * 当扩展类型为 app 时，如果不指定则会使用应用图标（appIcon）
        //   * 如果使用图片作为扩展图标，确保作为图标的图片长宽比例为1:1（正方形图片），并且大小不小于 512x512
        "icon": "mdi-star",

        // 扩展主要颜色，可能被用到自动生成的图标上或作为部分界面背景
        "accentColor": "#aa00ff",

        // 针对扩展类型 app - 应用界面类型
        // 可选值包括：
        //   * insideView：提供 React 组件作为界面视图
        //   * webView：完整的网页视图
        "appType": "insideView",

        // 当 appType 为 webView 时加载的页面地址，可以包含以下格式的地址：
        //   * 使用 http:// 或 https:// 协议开头的网站页面地址，例如 http://zui.sexy/m
        //   * 使用相对扩展包目录的相对地址，通常指向一个 html 文件，例如 lib/page/index.html
        "webViewUrl": "http://zui.sexy/m",

        // 当 appType 为 webView 时，指定一个脚本在 webview 页面中其他脚本执行之前先加载，此脚本必须为扩展包内的 JavaScript 文件。
        "webViewPreloadScript": "lib/preload.js",

        // 针对扩展类型 app - 应用图标，可以使用如下值
        //   * 使用 Material Design Icons (https://materialdesignicons.com/)，使用 mdi- 前缀，例如 mdi-star
        //   * 使用 http:// 或 https:// 协议开头图片地址，例如 http://zui.sexy/img/icon.png
        //   * 使用相对扩展包目录的相对地址，例如 img/icon.png
        // 需要注意：
        //   * 如果不指定则会使用扩展图标（icon）作为应用图标
        //   * 如果使用图片作为应用图标，确保作为图标的图片长宽比例为1:1（正方形），并且大小不小于 512x512
        "appIcon": "mdi-star",

        // 针对扩展类型 app - 应用配色，可能被用到图标上，如果不指定会使用扩展的 accentColor
        "appAccentColor": "#aa00ff",

        // 针对扩展类型 app - 界面背景色，可以设置为透明（transparent），默认为白色 #fff
        "appBackColor": "#fff",

        // 针对扩展类型 plugin 或 app - 模块主要入口脚本文件位置，可以包含以下格式的地址：
        //   * 使用相对扩展包目录的相对地址，例如 lib/index.js
        // 当扩展类型为 plugin 时会自动从扩展包目录下寻找 index.js 文件作为模块主入口文件
        "main": "lib/index.js",

        // 是否允许热加载扩展，默认值为 false，如果设置为 true，则安装扩展后无需重启才能使用，但 onUserLogin（用户已经登录后，如果是重新登录仍然会生效） 和 replaceViews 将不会立即生效（仍然需要在下次重启时生效）
        "hot": false,

        // 针对扩展类型 theme - 主题列表
        // 通过一个对象数组，声明多个主题配置
        "themes": [
            {
                // 主题内部名称
                "name": "dark",

                // 主题的描述文本，可能会在界面上显示
                "description": "这是一个暗黑主题",

                // 主题显示名称
                "displayName": "暗色",

                // 主题 CSS 文件位置，可以是相对包的路径或者一个可访问的网址
                "style": "lib/themes/dark.css",

                // 主题的主要颜色
                "color": "#ff00f1",

                // 主题载入方式，可取值包括：
                //   * append   在默认样式的基础上附加样式
                //   * override 替代默认样式
                "inject": "override",

                // 主题的预览图片地址
                "preview": "lib/themes/preview-dark.png"
            }
        ],

        // 为消息定义右键菜单项目
        "chatMessageMenu": [
            {
                "label": "保存消息文本到文件",
                "url": "!${EXTENSION}/saveText/?messageId=${messageId}"
            }
            // 更多右键菜单
        ],

        // 扩展配置（1.3 中尚未实现）
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
        ]
    },

    // 扩展的版本
    "version": "1.0.0",

    // 扩展开发的作者
    "author": "Catouse",

    // 扩展的发布者
    "publisher": "易软天创",

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

    // Bugs 反馈页面
    "bugs": {
      "url": "https://github.com/easysoft/xuanxuan/issues"
    }，

    // 代码库地址
    "repository": {
        "url": "https://github.com/easysoft/xuanxuan/",
        "type": "git"
    },

    // ...兼容其他 npm package.json 属性
}
```

### 全局扩展对象

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
      <td>语言管理模块</td>
    </tr>
    <tr>
      <td><code>app</code></td>
      <td>喧喧应用核心模块</td>
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

#### `lang`： 语言模块

##### `lang.name`

获取当前语言的名称，目前只会返回 `zh-cn`。

##### `lang.update(data: object)`

更新原来的语言配置。如果要临时更改默认的界面语言配置某些项目，可以在模块的 `onAttach` 方法内调用此方法来覆盖原始的语言配置。例如如下的代码将会将登录界面上的按钮文本由“登录”更改为“进入喧喧”：

```js
lang.update({
  'login.btn.label': '进入喧喧'
});
```

##### `lang.string(name: string, defaultValue: ?string)`

获取语言配置字符串。

* `name`: 配置名称；
* `defaultValue`: 可选，如果配置没有定义则返回此文本。

例如如下代码将获取登录按钮上的文本：

```js
const loginBtnLabel = lang.string('login.btn.label');
```

##### `lang.format(name: string, ...args: ?[string])`

获取从语言配置字符串格式化后的字符串。

* `name`: 配置名称；
* `args`: 用于格式化的参数。

```js
// fileSaveSuccessMsg 的值将为："文件已保存至 c:/1.txt"
const fileSaveSuccessMsg = lang.format('file.fileSavedAt.format', 'c:/1.txt');
```

#### `app`： 喧喧应用核心模块

app 模块为一个对象，包含了喧喧应用核心功能子模块。

<table>
  <thead>
    <tr>
      <th>子模块名称</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>profile</code></td>
      <td>管理当前登录的用户。</td>
    </tr>
    <tr>
      <td><code>members</code></td>
      <td>管理当前登录的用户拥有的联系人。</td>
    </tr>
    <tr>
      <td><code>db</code></td>
      <td>当前登录的用户使用的数据库。</td>
    </tr>
    <tr>
      <td><code>server</code></td>
      <td>网络服务处理和接口。</td>
    </tr>
    <tr>
      <td><code>models</code></td>
      <td>数据模型类。</td>
    </tr>
    <tr>
      <td><code>events</code></td>
      <td>事件消息管理对象。</td>
    </tr>
    <tr>
      <td><code>ui</code></td>
      <td>界面交互管理对象。</td>
    </tr>
    <tr>
      <td><code>notice</code></td>
      <td>消息通知管理对象。</td>
    </tr>
    <tr>
      <td><code>user</code></td>
      <td>当前登录的用户对象。</td>
    </tr>
    <tr>
      <td><code>im</code></td>
      <td>即时消息管理对象。</td>
    </tr>
  </tbody>
</table>

#### `components`：通用 React 组件

包含了 [`/app/components`](https://github.com/easysoft/xuanxuan/tree/master/app/components) 目录下所有通用的 React 组件类。这些组件可以用于开发内嵌界面的应用扩展。

#### `utils`：通用的工具类和函数

包含了 [`/app/utils`](https://github.com/easysoft/xuanxuan/tree/master/app/utils) 目录下所有通用的工具类和函数。

#### `platform`：平台 API

目前包含了 Electron 上可用的接口，可以用于检查窗口状态或操作窗口行为。

#### `views`：喧喧主窗口界面 React 组件

包含了 [`/app/views`](https://github.com/easysoft/xuanxuan/tree/master/app/views) 目录下所有主窗口界面上用到的所有 React 组件。

## 应用扩展

应用扩展可以方便开发者将自定义界面或网页嵌入到喧喧的界面中，方便用户访问使用。喧喧目前支持的应用嵌入方式包括：

* 直接将一个能够访问的页面作为应用嵌入，非常适合集成已经开发好了的页面应用，可以参考这个例子 [firefox-send-example](https://github.com/easysoft/xuanxuan/tree/master/examples/extensions/firefox-send-example) ；
* 在扩展包中提供一个 html 文件作为页面嵌入，用于开发一个全新的应用，但不想受官方界面样式表和 React 模式限制，可以参考这个例子 [helloworld-htmlapp-example](https://github.com/easysoft/xuanxuan/tree/master/examples/extensions/helloworld-htmlapp-example)，在你的 html 文件中执行的 JS 代码仍然可以使用 nodejs 的内置模块；
* 在入口模块的 `MainView` 属性上设置一个 React 组件作为嵌入的界面，方便的开发一个与官方界面融合的应用，可以参考这个例子 [helloworld-app-example](https://github.com/easysoft/xuanxuan/tree/master/examples/extensions/helloworld-app-example)，在你的 React 组件中可以使用全部的 nodejs 内置模块，并访问全局扩展对象。

一个最简单的应用扩展只需要在扩展包中包含一个 `package.json` 文件即可实现，下面以将火狐的文件传输应用包装为喧喧的应用扩展示例中的 `package.json` 文件内容：

```json
{
    "name": "firefox-send-example",
    "displayName": "火狐传送",
    "version": "1.0.0",
    "type": "app",
    "appType": "webView",
    "webViewUrl": "https://send.firefox.com/",
}
```

将写入以上内容的 `package.json` 文件打包为一个 zip 压缩文件，即可在喧喧中安装此应用扩展。喧喧也支持扩展名为 `.xext` 的扩展包。

![喧喧火狐传送应用扩展](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/extensions/extension-firefox-send.png)

### 管理应用扩展

喧喧的所以应用扩展都可以通过内置的 “应用” 应用来访问。

![喧喧应用扩展](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/extensions/app-home.png)

## 插件扩展

插件扩展通常不包含具体的界面，但可以在界面初始化及关键事件触发时得到通知并执行代码。例如可以通过监听用户发送消息，并在消息发送之前修改消息的内容。

每一个插件扩展需要提供一个入口模块文件，在 `package.json` 文件中通过 `main` 属性指定。如果不指定此文件则默认使用扩展包目录的 `index.js` 文件作为主入口模块文件。扩展主入口模块文件为一个 JavaScript 模块，当喧喧加载完毕时会逐个加载各个扩展的主入口模块。在扩展主入口模块中可以访问全局扩展对象 `global.Xext`。扩展主入口模块应该返回一个对象，该对象可以包含如下生命周期函数：

### 扩展主入口模块

<table>
  <thead>
    <tr>
      <td>函数</td>
      <td>说明</td>
      <td>参数</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>onAttach(ext)</code></td>
      <td>当扩展被加载后调用，此时可以对扩展进行初始化</td>
      <td>
        <ul><li><code>ext</code> 为当前被载入的扩展对象</li></ul>
      </td>
    </tr>
    <tr>
      <td><code>onReady(ext)</code></td>
      <td>当界面加载完毕时调用，此时扩展可以处理与界面相关操作。</td>
      <td>
        <ul><li><code>ext</code> 为当前被载入的扩展对象</li></ul>
      </td>
    </tr>
    <tr>
      <td><code>onDetach(ext)</code></td>
      <td>当扩展被卸载时调用，此时应该将扩展使用的资源进行释放，例如销毁定时器等</td>
      <td>
        <ul><li><code>ext</code> 为当前被载入的扩展对象</li></ul>
      </td>
    </tr>
    <tr>
      <td><code>onUserLogin(user, error)</code></td>
      <td>当用户登录完成时调用；</td>
      <td>
        <ul>
          <li><code>user</code> 为登录的用户对象</li>
          <li><code>error</code> 当登录失败时返回的错误信息</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>onUserLoginout(user)</code></td>
      <td>当当前登录的退出登录时调用</td>
      <td>
        <ul>
          <li><code>user</code> 为退出登录的用户对象</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>onUserStatusChange(status, oldStatus, user)</code></td>
      <td>当用户状态发生变化时调用</td>
      <td>
        <ul>
          <li><code>status</code> 为用户新的状态代码</li>
          <li><code>oldStatus</code> 为用户之前的状态代码</li>
          <li><code>user</code> 为当前状态发生变化的用户对象</li>
        </ul>
        <p>用户状态代码含义：</p>
        <ul>
          <li>unverified - <code>0</code>: 未登录</li>
          <li>disconnect - <code>1</code>: 登录过，但掉线了</li>
          <li>logined - <code>2</code>: 登录成功</li>
          <li>online - <code>3</code>: 在线</li>
          <li>busy - <code>4</code>: 忙碌</li>
          <li>away - <code>5</code>: 离开</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>onSendChatMessages(messages, chat, user)</code></td>
      <td>当用户发送聊天消息时调用</td>
      <td>
        <ul>
          <li><code>messages</code> 为用户要发送出去的消息对象数组</li>
          <li><code>chat</code> 为用户发送消息的会话对象</li>
          <li><code>user</code> 为当前发送消息的用户的对象</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>onReceiveChatMessages(messages, user)</code></td>
      <td>当用户接收到聊天消息时调用</td>
      <td>
        <ul>
          <li><code>messages</code> 为用户接收到的消息对象数组</li>
          <li><code>user</code> 为当前接收消息的用户的对象</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>onRenderChatMessageContent(content)</code></td>
      <td>当在界面上需要转化 markdown 格式的消息文本为 html 时会调用此回调方法</td>
      <td>
        <ul>
          <li><code>messages</code> 为用户接收到的消息对象数组</li>
          <li><code>user</code> 为当前接收消息的用户的对象</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>MainView</code></td>
      <td>当作为内嵌应用时的 React 实现的界面主组件</td>
      <td>
        <p><code>MainView</code> 应该返回一个 React 组件类或组件函数。</p>
      </td>
    </tr>
    <tr>
      <td><code>replaceViews</code></td>
      <td>用于配置替换系统内置界面组件</td>
      <td>
        <p><code>replaceViews</code> 为一个对象，对象的键名为要替换的组件路径，键值为要用来替换的 React 组件类或组件函数。</p>
      </td>
    </tr>
    <tr>
      <td><code>commands</code></td>
      <td>扩展支持的命令</td>
      <td>
        <p><code>commands</code> 为一个对象，对象的键名为响应的命令名称，键值为命令回调函数或者命令定义对象。</p>
      </td>
    </tr>
    <tr>
      <td><code>contextMenuCreators</code></td>
      <td>为消息增加操作菜单</td>
      <td>
        <p><code>contextMenuCreators</code> 为一个菜单生成对象数组，对象数组为每个菜单生成对象。菜单生成对象包括 `match` 属性用于定义匹配的菜单类型，`creator` 属性用于生成菜单项目的函数。</p>
      </td>
    </tr>
    <tr>
      <td><code>urlInspectors</code></td>
      <td>网址解释器，可以将消息中的网址渲染成卡片形式</td>
      <td>
        <p><code>urlInspectors</code> 为一个对象数组，每个对象包含有 `test` 属性为正则表达式用于匹配要解释的 url 地址，`inspector` 为回调函数（`function(url: string)`）用于生成 URL 对应的卡片参数。</p>
      </td>
    </tr>
  </tbody>
</table>

下面为一个简单等插件扩展主入口模块示例：

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

### 应用的插件机制

当一个扩展类型为 `app`(应用)时，同样可以在 `package.json` 文件中使用 `main` 属性指定一个主入口模块文件，从而使得一个应用扩展具备插件扩展的机制。同理，也可以将此方式理解为一个包含应用界面的插件。

### `replaceViews`：界面替换机制

在主入口模块中可以使用 `replaceViews` 字段指定一个对象来替换喧喧默认的界面组件，这些组件在 [`/app/views`](https://github.com/easysoft/xuanxuan/tree/master/app/views) 目录下。<code>replaceViews</code> 对象的键名为要替换的组件路径，键值为要用来替换的 React 组件类或组件函数。通过界面替换机制，可以使用插件的形式来定制喧喧的界面，例如将官方的登录界面替换为自己的实现。

下面的例子将展示使用自定义的 React 组件来替换官方的用户头像组件。这样可以将官方的圆形用户头像替换为方形的头像。更加详细的代码参考官方例子 [replace-user-avatar-example](https://github.com/easysoft/xuanxuan/tree/master/examples/extensions/replace-user-avatar-example)。

```js
// 主入口文件 index.js

const UserAvatar = require('./user-avatar');

module.exports = {
    replaceViews: {
        'common/user-avatar': UserAvatar,
    }
};
```

```js
// user-avatar.js 文件

// 从全局扩展对象中引入模块
const {
    views,
    components,
    utils,
    nodeModules,
} = global.Xext;

const {React} = nodeModules;
const {PropTypes, Component} = React;
const {StatusDot} = views.common;
const {Avatar, Emojione} = components;
const {HtmlHelper} = utils;

let todayTime = new Date();
todayTime.setHours(0, 0, 0, 0);
todayTime = todayTime.getTime();

class UserAvatar extends Component {
    render() {
        const user = this.props.user;
        const className = this.props.className;
        const showStatusDot = this.props.showStatusDot;

        // 使用 react 形式返回新的用户头像
    }
}

UserAvatar.propTypes = {
    user: PropTypes.object,
    className: PropTypes.string,
    showStatusDot: PropTypes.bool,
};

UserAvatar.defaultProps = {
    className: null,
    showStatusDot: null,
    user: null,
};

module.exports = UserAvatar;
```

## 主题扩展

主题扩展用于为喧喧提供额外的外观选项。一个主题扩展中可以提供多款主题供用户选择使用。主题扩展所提供的主题在 `package.json` 文件中通过 `themes` 字段进行声明。`themes` 字段为一个对象数组，数组中的每个对象为一个主题配置。

下面为官方暗黑主题的 `package.json` 文件:

```json
{
    "name": "dakr-theme-example",
    "displayName": "暗黑主题",
    "version": "1.0.0",
    "description": "提供 1 款暗黑主题外观。快让黑暗降临吧！",
    "type": "theme",
    "icon": "mdi-lightbulb",
    "accentColor": "#333",
    "themes": [
        {
            // 主题的名称，同一个扩展中的主题名称不能相同
            "name": "dark",

            // 主题在界面上显示的名称
            "displayName": "暗黑",

            // 主题的主色调
            "color": "#333",

            // 主题对应的 css 文件
            "style": "themes/dark.css",

            // 主题的载入方式
            "inject": "append"
        }
    ],
    // 其他配置
```

主题的 css 文件载入方式包括两种：

* `append`：将 css 文件作为默认样式表的补充，即挂在在默认主题样式的后面；
* `override`：将 css 文件替换原来的默认样式表。

这个主题可以在 [dark-theme-example](https://github.com/easysoft/xuanxuan/tree/master/examples/extensions/dark-theme-example) 找到源码。

### 主题管理

可以使用内置的主题管理应用来浏览已经通过扩展安装的主题以及切换使用主题。

![喧喧主题管理应用](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/extensions/app-themes.png)

## 扩展管理

扩展的浏览、安装、卸载通过内置的“扩展”应用实现。对于刚刚安装的插件类型扩展需要重启喧喧后生效。

![喧喧扩展](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/extensions/app-extensions.png)
![喧喧扩展查看](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/extensions/extension-view.png)

## 开发模式

当进行扩展开发时，无需将扩展打包为 `.zip` 文件进行安装测试，可以直接从开发目录加载扩展。从开发目录加载的扩展会显示 “开发中” 标签，显示配置文件中的错误，并且提供重新载入等快捷操作。

![喧喧扩展开发模式](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/extensions/extension-develop.png)

## 后台安装扩展

Version > 1.5 的版本，支持后台统一管理扩展应用。

### 然之
登录然之管理系统->后台管理->应用
添加(修改)应用
``平台``中勾选``喧喧``,设置``版本号``
上传``附件``，附件支持.zip或.xext。

### XXB
登录XXB->应用
添加(修改)应用
``平台``中勾选``喧喧``,设置``版本号``
上传``附件``，附件支持.zip或.xext。

