# 更新记录

## v 1.4.0

[2018-03-09]

本次更新增加了对 `wss` 协议的支持，浏览器端也可以使用安全模式了，另外对多处交互细节进行了优化，修复了目前社区反馈的大部分问题。欢迎更新！

### 更新明显：

+ 新增 对 `wss` 协议的支持，当所连接的服务器版本为 `1.4.0` 及以上时会启用 `wss` 协议，增强了安全性，并且支持浏览器端安全使用模式（启用官方证书的情况下）；
+ 优化 图片和文件上传交互，现在会正确显示上传进度，当在聊天中发送图片时，在完全接收图片之前会显示一个图片实际大小的占位符，接收到图片后页面不再发生抖动了；
+ 优化 聊天会话和联系人搜索框交互，新增 `ESC` 快捷键快速清除搜索框内容，并且不再区分讨论组和联系人搜索类别（总是可以在搜索框搜索全部讨论组和联系人会话），已删除的联系人会话不在出现在搜索结果中；
+ 优化 会话侧边栏界面，移除了成员标签页标题数目显示（现在会显示在标签页详情部分）；
+ 优化 聊天发送框中高亮 `@user` 功能，现在仅对系统中存在的用户生效，非系统用户不显示高亮效果；
+ 优化 讨论组和联系人列表分组交互，现在用户分组类型和展开折叠状态会保存在个人配置中，下次打开时会还原上次的状态；
+ 优化 用户个人配置同步策略，现在更改配置后会立即同步到服务器，另外修复'关闭消息框小提示'和 '发送高清表情' 配置项更改后没有生效的问题；
+ 优化 了消息中代码的样式，提供更好的配色；
+ 优化 了创建讨论组和重命名讨论组交互，现在没有填写讨论组名称时会进行提示；
+ 优化 了聊天右键菜单，已解散的讨论组不在支持编辑分组；
+ 优化 联系人列表上分组在线信息显示，不包括联系人的分组不显示在线信息；
+ 优化 文件列表界面，已下载的文件仍然会显示下载图标；
+ 修复 在浏览器上有时操作没有响应的问题；
+ 修复 了界面上点击某些按钮出现黑色块的问题；
+ 修复 连接到部分服务器上无法修改密码的问题；
+ 修复 搜索聊天和联系人时无法手动点击搜索结果的问题；
+ 修复 图文混发时文字和图片顺序不对的问题；
+ 修复 自动登录无法工作的问题；
+ 修复 了自动重连在 Windows 上有时没有工作的问题；
+ 修复 了用户退出讨论组后，聊天侧边栏用户列表没有刷新的问题；
+ 修复 了邀请用户之后对话框没有自动关闭的问题；
+ 修复 了多次快速按截图快捷键出现多个截图窗口的问题；
+ 修复 会话列表可以选择文本的问题；
+ 修复 了无法设置某些特殊快捷键的问题，并移除了某些特殊快捷键导致程序崩溃的问题；
+ 开发相关：
  - 客户端：
    * 修复 了在 Windows 上执行 `npm run package` 命令提示 `PKG_ARCH is not defined` 错误的问题（[issue #22](https://github.com/easysoft/xuanxuan/issues/22)）；
    * 优化 扩展加载机制，支持加载 `app/config/exts` 文件中配置的扩展为内部扩展；
    * 优化 扩展配置约定，如果插件类扩展没有指定 `main` 属性，则默认为 `'index.js'`；
    * 修复 加载插件类扩展失效的问题；
    * 优化 信息包格式，现在会发送 `v` 字段包含客户端版本，服务器可以使用该字段了解客户端版本并做差异化处理；
    * 优化 `$$version` 命令发送的内容，增加了服务器版本信息；
    * 升级 了 `electron-builder` 到 `v20.4.0` 解决了 Windows 安装程序在部分电脑上崩溃的问题。
  - XXD：
    * 修复 有时 xxd 服务器意外停止崩溃的问题；
    * 优化 与后端服务器通信格式，现在会在 http 请求的 headers 中包含 xxd 版本信息；
    * 优化 了一些提示信息。
  - 后端服务器：
    * 增加 xxb 服务器端，可以取代然之独立运行；
    * 优化 与 xxd 服务器通信格式，现在会在 http 请求的 headers 中包含后端服务器版本信息；
    * 优化 `chat/getUserList` 接口，现在在返回的用户信息中会包含 `qq` 字段。

### 下载地址：

* Windows 7+：[64 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.win64.setup.exe)、[64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.win64.zip.exe)、[32 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.win32.setup.exe)、[32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.win32.zip.exe)、[64 位 Debug 安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.win64.debug.setup.exe)；
* MacOS：[xuanxuan.1.4.0.mac.dmg](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.mac.dmg)；
* Linux：[64 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.linux.x64.tar.gz)、[64 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.linux.amd64.deb)、[64 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.linux.x64.rpm)、[32 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.linux.ia32.tar.gz)、[32 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.linux.i386.deb)、[32 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.linux.ia32.rpm)；
* 浏览器端：[xuanxuan.1.4.0.browser.zip](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.browser.zip)；
* XXD Server： [windows 64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.4/xxd.1.4.0.win64.zip)、[windows 32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.4/xxd.1.4.0.win32.zip)、[mac 压缩包](http://dl.cnezsoft.com/xuanxuan/1.4/xxd.1.4.0.mac.tar.gz)、[linux 64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.4/xxd.1.4.0.linux.x64.tar.gz)、[linux 32 位 压缩包](http://dl.cnezsoft.com/xuanxuan/1.4/xxd.1.4.0.linux.ia32.tar.gz)；
* 服务器端：
  * XXB 1.0：[Windows 64位一键安装包](http://dl.cnezsoft.com/xuanxuan/1.3/xxb.1.0.win_64.exe)、[Windows 32位一键安装包](http://dl.cnezsoft.com/xuanxuan/1.3/xxb.1.0.win_32.exe)、[Linux 64位一键安装包（Linux一键安装包必须直接解压到/opt目录下）](http://dl.cnezsoft.com/xuanxuan/1.3/xxb.1.0.zbox_64.tar.gz)、[Linux 32位一键安装包（Linux一键安装包必须直接解压到/opt目录下）](http://dl.cnezsoft.com/xuanxuan/1.3/xxb.1.0.zbox_32.tar.gz)、[Linux rpm安装包](http://dl.cnezsoft.com/xuanxuan/1.3/xxb-1.0-1.noarch.rpm)、[Linux deb安装包](http://dl.cnezsoft.com/xuanxuan/1.3/xxb-1.0.deb)；
  * 然之：[4.6.1 稳定版](http://www.ranzhi.org/dynamic/4.6.1.stable-105.html)、[扩展包](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan-ranzhi.1.4.0.zip)。


## v 1.3.0

[2017-12-01]

本次更新带来了大家期待的扩展机制，提供了更灵活的方式将你到业务与喧喧进行集成；另外还带来了多个实用功能，包括聊天记录搜索、讨论组解散、按部门或角色分组查看联系人、修改密码等。新增的暗黑主题，让你的体验焕然一新，快来试试吧！

### 更新明细

+ 新增 扩展机制：
  - 支持如下类型的扩展：
    - 插件（`plugin`），扩展喧喧现有的功能；
    - 应用（`app`），提供将用户自行开发的界面或者网页集成到喧喧中；
    - 主题（`theme`），提供额外的界面风格供用户切换使用。
  - 用户可以手动安装所需的扩展包（`.xext` 文件）；
  - 内置如下应用扩展：
    - 应用：用于管理用户通过扩展安装的应用；
    - 文件：管理用户在聊天中发送和接收的所有文件；
    - 主题：管理用户通过扩展安装的主题，并切换当前使用的主题外观；
    - 扩展：管理所有已安装的扩展；
  - 内置了一个主题扩展，提供了一款暗黑风格的主题外观；
+ 新增 聊天记录搜索功能，允许限定搜索的聊天类型和时间范围，也可以指定搜索单个聊天的记录，从搜索结果中可以方便的查看搜索的记录在原聊天中的上下文；
+ 新增 联系人列表视图切换功能，支持以平铺（原默认形式）、自定义分组、角色和部门分组查看联系人，自定义分组可以通过拖拽调整分组显示顺序，已删除的用户账号如果之前有聊天历史记录会显示在单独的“已删除”分组中管理，显示当前登录的用户信息在联系人列表上一直显示不再作为配置项；
+ 新增 讨论组会话列表按自定义分组浏览功能，自定义分组可以通过拖拽调整分组显示顺序，被解散的讨论组会话会单独在“已解散”分组中管理；
+ 新增 登录界面记住用户密码和自动登录功能；
+ 新增 在聊天中 `@所有人` （或者 `@all`）的功能；
+ 新增 修改账号密码功能；
+ 新增 管理员从讨论组移除用户功能；
+ 新增 管理员解散讨论组功能，已解散的讨论组在解散后 3 个月内仍然会在单独的分组中显示，支持查看已解散的讨论组消息记录；
+ 优化 聊天邀请成员参与对话框界面，现在支持搜索；
+ 优化 聊天记录同步功能，现在可以按照时间范围进度同步，节省同步时间；
+ 优化 聊天搜索交互方式，当搜索框失去焦点时会隐藏搜索结果，获得焦点时显示搜索结果，增加对快捷键的支持，上下快捷键可以切换选中，按 Enter 键可以直接打开选中的聊天；
+ 优化 个人资料对话框界面，增加对账号角色和部门信息的显示；
+ 优化 聊天列表栏目界面，支持通过拖拽边缘调整栏目宽度；
+ 优化 聊天一对一聊天侧边栏交互，默认不显示，原来显示成员的标签页现在显示对方的个人资料信息；
+ 优化 聊天侧边栏文件列表界面外观；
+ 优化 界面上右键菜单界面和交互动画效果；
+ 优化 `@user` 提示文本，现在人称代词会依据用户的真实性别决定；
+ 优化 聊天界面，公开讨论组会显示图标代替原来的文字标签，优化了刚打开聊天界面时无法向上滚动的时间；
+ 优化 截图窗口界面，增加使用快捷键退出（`ESC`）和确认(`Enter`)；
+ 修复 在 Windows 上截图时光标闪烁的问题；
+ 修复 聊天消息显示顺序偶尔不正确的问题；
+ 修复 传送文件时多次收到桌面通知提醒的问题；
+ 修复 通知栏右键菜单退出失效的问题；
+ 修复 登录后没有显示签到提示信息的问题；
+ 修复 浏览器客户端上重复登录被踢出时没有消息提示的问题；
+ 修复 注册全局快捷键发生错误的问题，参见 [issue #17](https://github.com/easysoft/xuanxuan/issues/17)；
+ 更换了喧喧的 logo；
* 开发相关：
  + 客户端：
    - 扩展机制：
      - 支持加载开发中的扩展，直接选定开发中的扩展目录中的 `package.json` 文件即可；
      - 内置扩展开发支持，在 `/app/build-in/` 目录下的扩展包会直接打包为内置的扩展，或者直接在最终打包后的程序目录 `resource/build-in` 目录下放置扩展目录；
      - 使用 replaceViews 替换喧喧原来的界面组件；
      - 提供了扩展示例：https://github.com/easysoft/xuanxuan/tree/master/examples/extensions
    - Electron 升级到 1.7.0；
    - 新增 通过 `Platform` 的 `lang` 对象来覆盖原语言配置文件；
    - 新增 登录界面通过浏览器地址栏参数设置默认的账号和提示信息；
    - 新增 eslint 开发配置来优化代码结构；
    - 修复 VSCode 配置问题；
    - 新增 npm 命令 `npm run hot-server-browser` 和 `npm run start-browser`，方便进行浏览器端开发调试；
    - 优化 webpack 配置文件，现在所以配置文件和开发构建相关文件放置在单独的文件夹中（`/build/`）；
  + 然之服务器端：
    - 新增 `chat/dismiss` 方法，用于请求解散一个讨论组；
    - 新增 `chat/category` 方法，用于请求为一个会话设置分组；
    - 优化 `chat/usergetlist` 方法，增加 `idList` 参数，可以获取已删除的用户信息，如果不指定 `idList` 参数会返回部门和角色数据；
    - 优化 `chat/login` 方法， 会返回当前登录的用户然之地址；
    - 优化 `chat/history` 方法，增加 `startDate` 参数，现在可以限定需要获取的消息记录最早日期；
    - 修复 有时一对一的聊天消息会发送给所有人的问题。

**注意**：1.3 增加了大量新的功能，需要服务器也升级到 1.3 才能体验所有内容。

### 下载地址：

* Windows 7+：[64 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-win64-setup.exe)、[64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-win64-zip.exe)、[32 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-win32-setup.exe)、[32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-win32-zip.exe)、[64 位 Debug 安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-debug-win64-setup.exe)
* MacOS：[xuanxuan-1.3.0-mac.dmg](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-mac.dmg)
* Linux：[64 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-linux-x64.tar.gz)、[64 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-linux-amd64.deb)、[64 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-linux-x64.rpm)、[32 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-linux-ia32.tar.gz)、[32 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-linux-i386.deb)、[32 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-linux-ia32.rpm)
* 浏览器端：[xuanxuan-1.3.0-browser.zip](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan-1.3.0-browser.zip)
* Server: [windows 64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.3/xxd-1.3.0-win64.zip)、[windows 32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.3/xxd-1.3.0-win32.zip)、[mac 压缩包](http://dl.cnezsoft.com/xuanxuan/1.3/xxd-1.3.0-mac.tar.gz)、[linux 64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.3/xxd-1.3.0-linux-x64.tar.gz)、[linux 32 位 压缩包](http://dl.cnezsoft.com/xuanxuan/1.3/xxd-1.3.0-linux-ia32.tar.gz)；
* 然之：[扩展包](http://dl.cnezsoft.com/xuanxuan/1.3/xuanxuan.ranzhi-1.3.0.zip)

## v 1.2.0

[2017-10-09]

本次更新对客户端界面进行了重构，并增加了对浏览器端的支持，现在可以在浏览器上直接使用喧喧了。另外优化了登录交互方式，并修复了多处错误，新增的断线重连功能可以适应网络不稳定的环境使用。

### 更新明细：

* **客户端**
  + 增加了对浏览器端支持，除截图及文件相关操作，其他功能拥有与桌面客户端基本一致的体验；
  + 增加了 Markdown 预览功能，可以在发送消息之前预览最终效果，Markdown 新手也可以放心使用；
  + 优化了广播消息的外观及增加了更多的广播消息，现在当用户加入或退出讨论组都会在讨论组中发布广播消息；
  + 优化了消息中代码块的显示效果，优化了代码高亮外观，并允许用户使用 ```js:文件名` 的形式为代码块指定标题或文件名；
  + 现在小于 10kb 的图片会通过 Socket 接口直接发送，而无需使用 http 文件上次接口，用户可以更快的发送和接收小图片；
  + 优化了消息通知交互方式，增加了使用系统原生通知方式（已弹窗的方式提示新消息，并在系统通知栏内显示）；
  + 消息记录增加从云端同步全部消息的功能，并且在用户第一次登录到客户端时会自动在后台从云端同步所有消息记录；
  + 消息发送框内的表情符现在可以直接删除，而不是需要逐个删除短名称字符，并支持 windows 平台上显示用户通过输入法输入的表情字符；
  + 禁用了发送空白消息，当发送框没有实际可显示的内容时点击发送键会清空发送框；
  + 优化了文件和图片上传下载交互体验，现在会显示上传下载进度；
  + 优化会话右侧边栏拖拽调整宽度交互方式，现在会自动保存调整后的固定宽度，而不是保存百分比；
  + 优化了应用加载前的界面，现在会显示加载进度条；
  + 表情（[Emojione](https://github.com/emojione/emojione)）图像资源更新到 3.1.2；
  + 增加了断线重联功能，现在对于非用户或服务器主动断开链接对情况会进入自动反复尝试重连状态，直到用户退出或重新连接上服务器；
  + 使用 MZUI 重构了界面，去掉了对 Material UI、Momoent.js 等第三方库对依赖，大幅减少了最终代码体积，集成了路由功能，对浏览器用户更加友好，重构了右键菜单界面并兼容浏览器端；
  + Electron 等于平台相关对代码进行了分离，并增加了浏览器平台的支持，并可以更方便的移植到其他平台（例如 Chtrome app）；
  + 优化代码结构，数据库管理模块更换为 [dexie.js](http://dexie.org/)（数据库查询效率更高），本地配置不再依赖桌面文件系统，而是直接使用浏览器对 localStorage；
* **服务器端**
  + 增加了对 http 的支持，允许客户端直接使用 http 方式连接到服务器进行测试（在配置文件中将 isHttps 设置为 0 即可启用 http 方式），http 会使用不安全方式发送关键信息，使得加密功能失效，请确保在实际应用环境中不要启用此选项；
  + http(s) 接口现在支持浏览器端跨域访问；
  + 提供了更友好的文件下载接口，现在不再需要每次为请求头部设置验证信息。

### 下载地址：

* Windows 7+：[64 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-win64-setup.exe)、[64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-win64-zip.exe)、[32 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-win32-setup.exe)、[32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-win32-zip.exe)、[64 位 Debug 安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-debug-win64-setup.exe)
* MacOS：[xuanxuan-1.2.0-mac.dmg](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-mac.dmg)
* Linux：[64 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-linux-x64.tar.gz)、[64 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-linux-amd64.deb)、[64 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-linux-x64.rpm)、[32 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-linux-ia32.tar.gz)、[32 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-linux-i386.deb)、[32 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-linux-ia32.rpm)
* 浏览器端：[xuanxuan-1.2.0-browser.zip](http://dl.cnezsoft.com/xuanxuan/1.2/xuanxuan-1.2.0-browser.zip)
* Server: [windows 64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.2/xxd-1.2.0-win64.zip)、[windows 32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.2/xxd-1.2.0-win32.zip)、[mac 压缩包](http://dl.cnezsoft.com/xuanxuan/1.2/xxd-1.2.0-mac.tar.gz)、[linux 64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.2/xxd-1.2.0-linux-x64.tar.gz)、[linux 32 位 压缩包](http://dl.cnezsoft.com/xuanxuan/1.2/xxd-1.2.0-linux-ia32.tar.gz)；
* 然之：[源码包](http://dl.cnezsoft.com/ranzhi/4.2.2/ranzhi.4.2.2.zip)、[windows 一键安装包](http://dl.cnezsoft.com/ranzhi/4.2.2/ranzhi.4.2.2.exe)、[linux rpm 安装包](http://dl.cnezsoft.com/ranzhi/4.2.2/ranzhi-4.2.2-1.noarch.rpm)、[linux deb 安装包](http://dl.cnezsoft.com/ranzhi/4.2.2/ranzhi_4.2.2_1_all.deb)。


## v 1.1.1

[2017-05-05]

本次更新集成了然之的签到功能，对客户端界面进行了大量交互细节优化，并且处理社区反馈的大量问题。现在最新发布的然之 4.2.2 已内置喧喧最新版本，大家无需在为然之安装扩展。喧喧还启用了全新的域名 [xuan.im](http://xuan.im)，欢迎大家访问网站了解更多内容。

### 更新明细：

* **客户端**：
  + 增加用户个人配置云同步功能，在登录时会从服务器获取客户端配置，退出时上传个人配置到服务器；
  + 现在会记住用户上次保存文件的位置，在打开保存位置对话框时会自动定位到用户上次保存的位置；
  + 在上传文件之前会先检查服务器设置的最大允许上传文件大小，如果不符合要求会提示用户并拒绝上传文件；
  + 修复上传或下载文件服务器提示错误没有捕捉到的问题；
  + 用户当天第一次登录时会提示签到成功的消息；
  + 更改导航上项目顺序，现在讨论组排在联系人上方；
  + 最近会话不再是可选的（已经从设置面板中移除设置），首次启动时会默认显示最近会话；
  + 当最近会话没有中导航上激活时，如果当前会话收到消息或着向外发送了消息会自动激活最近会话；
  + 当激活一个包含新消息的会话时会自动滚动到消息列表的底部（如果在之前滚动位置发生过变化）；
  + 优化导航下拉菜单界面，去掉“离线”条目，增加“注销”条目；
  + 优化会话和联系人搜索功能，现在当在联系人列表时只会在联系人会话中查找，当在讨论组列表时只在讨论组中查找，最近会话列表中可以查找所有会话；
  + 修复第一次使用时没有在导航上定位到最近会话的问题；
  + 调整了系统会话在讨论组列表上的显示顺序，现在系统会话会显示在除加星会话的上方；
  + 优化了会话底部工具栏上的图标外观，增加更改字体大小图标按钮，点击按钮会弹出面板来实时更改字体大小，更改会话字体大小功能不再在会话下拉菜单中提供访问入口；
  + 调整了默认会话字体设置，现在文字的行间距更适合阅读；
  + 现在在消息发送框“@他人”时，默认显示用户真实姓名；
  + 修复无法显示消息中的空白行的问题；
  + 修复有用户推出讨论组时，讨论组消息短暂消失的问题；
  + 会话侧边栏文件列表中不再显示发送失败的文件，移除了文件列表中的图标，修复了有时文件名无法显示完整的问题，修复了文件列表无法自动更新的问题；
  + 修复了会话侧边栏上的成员列表在有用户退出时没有正确刷新的问题，修复了一对一会话也显示管理员标志的问题；
  + 调整会话侧边栏最小宽度；
  + 现在请求退出应用时（点击关闭按钮或者在通知栏图标上选择退出），会立即关闭主界面而不是先显示登录界面再退出；
  + 当服务器连接超时时，会在客户端上显示提示消息；
  + 优化新建会话对话框中联系人排列顺序；
  + 优化 Windows 上用户个人设置对话框操作按钮显示顺序；
  + 优化在 Windows 上任务栏高亮闪烁提示功能，现在会一直高亮，直到窗口被激活；
  + 优化关于对话框上的内容显示；
  + 优化界面上工具提示显示的动画效果；
  + 优化了界面上的文本，更符合语义；
  + 开发支持：
    - 修复了第一次启动调试时等待时间过长的问题，移除了首次运行自动安装 React 扩展策略；
* **xxd 服务器**
  + 增加了xxd到然之服务器和客户端的通信容错处理；
  + 增加了默认然之服务器的设置，客户端登录不填写服务器名称时xxd使用默认设置；
  + 增加了限制附件上传大小的配置；
* **然之服务器**
  + 加解密功能优先使用 `openssl` 扩展，其次选择 `mcrypt` 扩展，两者都未启用时使用内置纯 PHP 实现的 AES 加密类库；
  + 喧喧登录和然之签到集成，可以在然之中设置只能通过喧喧签到；
  + 然之内置对喧喧 1.1.1 的支持，现在使用最新版然之（4.2.2+）不再需要为然之安装喧喧扩展包；
  + 修复新系统安装后没有系统会话（包含系统所有成员的讨论组）的问题；
  + 然之升级时检测喧喧版本，并自动升级喧喧；
  + 可以在然之后台设置和xxd通信需要的密钥；
* **网站和文档**
  + 网站启用全新域名：[http://xuan.im](http://xuan.im)；
  + 文档进行了更新。

### 下载地址：

* Windows 7+：[64 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-win64-setup.exe)、[64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-win64-zip.exe)、[32 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-win32-setup.exe)、[32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-win32-zip.exe)、[64 位 Debug 安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-debug-win64-setup.exe)
* MacOS：[xuanxuan-1.1.1-mac.dmg](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-mac.dmg)
* Linux：[64 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-linux-x64.tar.gz)、[64 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-linux-amd64.deb)、[64 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-linux-x64.rpm)、[32 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-linux-ia32.tar.gz)、[32 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-linux-i386.deb)、[32 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.1-linux-ia32.rpm)
* Server: [windows 64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.1-win64.zip)、[windows 32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.1-win32.zip)、[mac 压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.1-mac.tar.gz)、[linux 64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.1-linux-x64.tar.gz)、[linux 32 位 压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.1-linux-ia32.tar.gz)；
* 然之：[源码包](http://dl.cnezsoft.com/ranzhi/4.2.2/ranzhi.4.2.2.zip)、[windows 一键安装包](http://dl.cnezsoft.com/ranzhi/4.2.2/ranzhi.4.2.2.exe)、[linux rpm 安装包](http://dl.cnezsoft.com/ranzhi/4.2.2/ranzhi-4.2.2-1.noarch.rpm)、[linux deb 安装包](http://dl.cnezsoft.com/ranzhi/4.2.2/ranzhi_4.2.2_1_all.deb)。

## v 1.1.0

[2017-04-28]

本次更新大幅改进客户端界面交互体验，增加会话和联系人搜索功能，优化表情显示，增加个人设置面板，轻松定制消息提醒方式和窗口界面行为。

服务器进行了重大改进：增加全新的 go 语言实现的服务器（xxd），全程使用 AES 加密消息，通过 WebSocket 和 https 与客户端通信，使用 http 或 https 与然之服务器或你的网站进行通信。重构了然之服务器（现在然之服务器仅提供 http 接口）。客户端仍然支持 1.0 版的服务器，需要在登录框填写服务器地址时添加 `#v1.0` 后缀。

### 更新明细：

* **客户端**：
  - 重构了导航布局，现在头像默认在下方显示（可以在个人设置中更改），去掉了导航折叠和展开功能，原会话和通讯录标签改为最近聊天（最近聊天可以在个人设置中关闭）、联系人和讨论组；
  - 全新的会话列表功能，可以按照最近聊天、联系人和讨论组分别查看对应的会话，原通讯录功能已合并到联系人会话列表，优化了会话列表界面，现在更易于区分收藏的会话或离线联系人会话，公开频道现在更名为公开讨论组；
  - 增加会话搜索功能，并支持使用用户联系方式、拼音全拼或简拼进行搜索；
  - 增加个人设置功能，可以在用户头像下拉菜单中打开个人设置面板，方便用户个性化聊天、通知、导航、窗口及快捷键等多个设置选项；
  - 优化所以对话框中操作按钮的显示顺序，现在会根据运行平台使用符合用户操作系统习惯的顺序显示；
  - 重构了表情选择面板，现在能够选择全部 Emoji 表情😄，并支持搜索表情（需要中个人设置中开启表情搜索功能），表情符图片资源已升级到 Emoji one 3.0；
  - 新建讨论组时会提示为讨论组设置名称；
  - 会话侧边栏现在支持通过拖拽边缘来调整宽度，并且会自动保存侧边栏状态到用户配置；
  - 讨论组会话会在初始状态下自动显示侧边栏；
  - 优化侧边栏上的用户列表显示顺序，现在优先显示管理员用户和在线用户；
  - 消息发送框中的表情快捷代码会自动转换显示为表情符😊，如果消息发送框中只包含一个表情符会自动使用高清表情图片发送（可以在个人设置中关闭），在消息框中输入的所有 emoji unicode 字符会中发送之前自动转换为快捷代码以防止服务器不支持特殊字符；
  - 消息发送框中输入 @用户 会自动高亮显示用户名称并支持点击查看用户资料；
  - 优化会话消息列表界面，高亮显示提到（@me）自己的字符，消息中的表情符边缘会更加突出易于辨认，现在复制消息列表中的消息不会中复制的内容中包含时间文本；
  - 现在全局截图后会将图片放置在剪切版；
  - 现在允许关闭消息框小技巧提示按钮（可以在个人设置中重新开启）；
  - 点击侧边栏用户列表上的用户默认操作为在消息发送框中 @此用户；
  - 优化消息中包含一级或二级标题格式文本的显示，现在会以更易于阅读的样式显示；
  - 修复了中消息中以代码发送 `<`、 `>` 会被转码的问题；
  - 优化了消息中的代码显示样式；
  - 修复在 Windows 上复制消息并粘贴到消息发送框自动在首尾添加空格的问题；
  - 修复会话消息历史记录中链接点击出现界面空白的问题；
  - 修复新建会话时查找公开会话失败的问题（issue #6）；
  - 修复了有时退出应用没有保存用户配置的问题；
  - 修复了有时没有正确下载用户头像的问题；
  - 修复了有时退出应用没有向服务器发送 `chat/logout` 事件；
  - 增加了新的个人设置当主窗口失去焦点时自动最小化窗口；
  - 客户端运行文件名更改为英文名称；
  - 优化了喧喧界面及应用图标，现在看起来更正；
  - 开发支持：
    + 修复了在 Windows 平台上的 VSCode 执行调试任务失败的问题；
* **然之服务器端**：
  - 抛弃了基于 PHP 的 socket 实现，所有 API 全部使用 http 实现，配合 xxd 服务器与客户端通信；
* **xxd 服务器**：
  - 新的 xxd 服务与客户端通过 WebSocket 和 https 进行通信，通过 https 或 http 与然之服务器端通信。

### 下载地址：

* Windows 7+：[64 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-win64-setup.exe)、[64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-win64-zip.exe)、[32 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-win32-setup.exe)、[32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-win32-zip.exe)、[64 位 Debug 安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-debug-win64-setup.exe)
* MacOS：[xuanxuan-1.1.0-mac.dmg](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-mac.dmg)
* Linux：[64 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-linux-x64.tar.gz)、[64 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-linux-amd64.deb)、[64 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-linux-x64.rpm)、[32 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-linux-ia32.tar.gz)、[32 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-linux-i386.deb)、[32 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-linux-ia32.rpm)
* Server: [windows 64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.0-win64.zip)、[windows 32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.0-win32.zip)、[mac 压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.0-mac.tar.gz)、[linux 64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.0-linux-x64.tar.gz)、[linux 32 位 压缩包](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.0-linux-ia32.tar.gz)；
* 然之：[xuanxuan-1.1.0-server-rangerteam.zip](http://dl.cnezsoft.com/xuanxuan/1.1/xuanxuan-1.1.0-server-rangerteam.zip)。

## v 1.0.2

[2017-03-13]

修复了一些重要问题：

* 修复了使用 Enter 键发送消息仍然会在消息中插入回车符的问题；
* 修复长时间不使用会掉线的问题；
* 修复用户能够直接发送 HTML 的问题，现在用户在消息中的 HTML 字符都会被转码；
* 修复联系人页面搜索某一用户发送消息后，搜索框仍然显示的问题；
* 修复极端情况下登录成功但返回了其他用户的登录个人信息的问题（当两个用户在同一时间登录可能会发生）；
* 修复使用子目录访问然之导致用户头像无法显示的问题；
* 修复了在 Windows 上最小化后收到消息时没有播放提示音且通知栏图标没有闪烁的问题；
* 现在当窗口处于打开状态但没有激活时收到新消息会闪烁任务栏更易于发现；
* 修复可能会保存未登录成功的用户配置的问题；
* 修复新建一对一会话后会在消息输入框提示重命名的问题（一对一会话无法进行重命名）。

下载地址：

* Windows 7+：[64 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-win64-setup.exe)、[64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-win64-zip.exe)、[32 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-win32-setup.exe)、[32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-win32-zip.exe)、[64 位 Debug 安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-debug-win64-setup.exe)
* MacOS：[xuanxuan-1.0.2-mac.dmg](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-mac.dmg)
* Linux：[64 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-linux-x64.tar.gz)、[64 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-linux-amd64.deb)、[64 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-linux-x64.rpm)、[32 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-linux-ia32.tar.gz)、[32 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-linux-i386.deb)、[32 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.2-linux-ia32.rpm)

## v 1.0.1

[2017-02-27]

修复了一些问题并增加了 Linux 安装包。

更新明细：

* 增加数据库断线重连的功能，增强服务器端稳定性;
* 增加控制脚本来实现服务器端的启动、停止、重启以及状态查询;
* 修复服务器地址包含端口号时无法找到正确 Socket 服务器 IP 的错误；
* 延长了登录时的等待超时判断时间；
* 禁用 Window 上的系统菜单；
* 开发支持：
  - 客户端开发增加对 DEBUG 版本打包的支持；
  - 增加对 Linux 平台打包的支持；
  - 修复了在 Windows 启动 React 热替换服务的错误；
  - 更新了服务器部署开发文档；

下载地址：

 * Windows 7+：[64 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-win64-setup.exe)、[64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-win64-zip.exe)、[32 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-win32-setup.exe)、[32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-win32-zip.exe)
 * MacOS：[xuanxuan-1.0.1-mac.dmg](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-mac.dmg)
 * Linux：[64 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-linux-x64.tar.gz)、[64 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-linux-amd64.deb)、[64 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-linux-x64.rpm)、[32 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-linux-ia32.tar.gz)、[32 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-linux-i386.deb)、[32 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.0.1-linux-ia32.rpm)

## v 1.0.0

[2017-02-17]

喧喧是由[然之协同](http://ranzhico.com)推出的即时通信解决方案，包括多平台的桌面客户端软件和配合然之协同使用的服务器端插件。

首发版本提供如下特色功能：

* **开聊**：和服务器上的任何用户开聊，收发表情、图片、截屏、文件样样在行；
* **讨论组**：一个人讨论的不过瘾？随时邀请多人组建个性讨论组；
* **公开频道**：将讨论组公开，任何感兴趣的人都可以加入进来；
* **通知及提醒**：与系统桌面环境集成，即时收到新消息通知；
* **会话管理**：将任意会话（包括讨论组和频道）置顶，精彩内容不容错过，还可以重命名讨论组、为讨论组设置白名单及浏览会话的所有消息历史记录；
* **通讯录**：浏览企业成员信息；
* **轻量级服务器端**：轻松搭配[然之协同](http://ranzhico.com)使用。

更多内容参见官方网站：http://xuan.im
