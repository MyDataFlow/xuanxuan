# 更新记录

## v 1.1.0

[2017-04-24]

大幅改进客户端界面交互体验，增加会话和联系人搜索功能，优化表情功能等多项改进。增加个人设置面板，轻松定制消息提醒方式和窗口界面行为。

服务器进行了重大改进。增加全新的 go 语言实现的服务器（xxd），支持 AES 加密消息，使用 WebSocket 和 https 与客户端通信，使用 http 或 https 与然之服务器或你的网站进行通信。重构了然之服务器（现在然之服务器仅提供 http 接口）。客户端仍然支持 1.0 版的服务器，需要在登录框填写服务器地址时添加 `#v1.0` 后缀。

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

下载地址：

* Windows 7+：[64 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-win64-setup.exe)、[64 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-win64-zip.exe)、[32 位安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-win32-setup.exe)、[32 位压缩包](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-win32-zip.exe)、[64 位 Debug 安装包（.exe）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-debug-win64-setup.exe)
* MacOS：[xuanxuan-1.1.0-mac.dmg](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-mac.dmg)
* Linux：[64 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-linux-x64.tar.gz)、[64 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-linux-amd64.deb)、[64 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-linux-x64.rpm)、[32 位（.tar.gz）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-linux-ia32.tar.gz)、[32 位（.deb）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-linux-i386.deb)、[32 位（.rpm）](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-linux-ia32.rpm)
* Server: [Ranzhi xuanxuan extension](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-ranzhi-ext.zip)、[xxd server](http://dl.cnezsoft.com/xuanxuan/1.0/xuanxuan-1.1.0-xxd.zip)

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

更多内容参见官方网站：http://xuanxuan.chat
