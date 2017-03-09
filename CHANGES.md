# 更新记录

## v 1.0.2

[2017-03-09]

主要修复了一些重要问题：

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
