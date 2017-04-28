# 喧喧

http://xuanxuan.chat

由[然之协同](http://ranzhico.com)提供的面向企业即时通信解决方案。

![喧喧](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/preview.png)

## 特色功能

* **开聊**：和服务器上的任何用户开聊，收发表情、图片、截屏、文件样样在行；
* **开源安全**：源码开放，客户端和服务器通信全程加密，安全可靠；
* **讨论组**：一个人讨论的不过瘾？随时邀请多人组建个性讨论组；
* **公开讨论组**：将讨论组公开，任何感兴趣的人都可以加入进来；
* **通知及提醒**：与系统桌面环境集成，即时收到新消息通知；
* **会话管理**：将任意会话（包括讨论组和公开讨论组）置顶，精彩内容不容错过，还可以重命名讨论组、为讨论组设置白名单及浏览会话的所有消息历史记录；
* **通讯录**：浏览企业成员资料和联系信息；
* **轻量级服务器端**：轻松搭配[然之协同](http://ranzhico.com)使用。

## 使用

### 客户端

受益于 Electron 的跨平台特性，喧喧客户端提供了 Windows、MacOS 和 Linux 版本。

下载地址见：http://xuanxuan.chat/#downloads

更多帮助参见 [官方客户端使用指南](http://xuanxuan.chat/page/1.html)。

### 服务器端

客户端主要通过 `WebSocket` 协议与服务器端进行实时通信，另外还用到了 `https` 协议来从服务器获取配置及上传下载文件。

```
+------------+                 +------------+            +----------------+
|  Xuanxuan  |---------------->|  Xuanxuan  |----------->|   Rangerteam   |
|   Client   | WebSocket/Https |   Server   | Http/Https |     Server     |
|  (PC/Mac)  |<----------------|   (xxd)    |<-----------| (Your Website) |
+------------+                 +------------+            +----------------+
```

客户端与服务器端 API 参考：[API 文档](http://xuanxuan.chat/page/3.html)。服务器端 API 同样是开放的，你可以使用自己熟悉的技术（例如 node.js、go、swift）实现自己的服务器端。

官方默认的服务器使用 `go` 语言实现（简称为 `xxd` 服务），你可以在 [`/server/xxd/`](https://github.com/easysoft/xuanxuan/tree/master/server/xxd) 目录下找到源代码。xxd 服务提供了 `WebSocket` 和 `https` 接口供客户端使用。

`xxd` 服务本身并不存储和管理用户资料和消息数据，而是使用应用更为广泛的 http 协议与另一个服务器（简称 `http` 服务）通信。这样你只需要在你自己的网站上开发一系列 `http` 接口即可为你的网站用户启用喧喧。

官方默认提供的 `http` 服务是基于开源协同办公软件 [然之协同](https://github.com/easysoft/rangerteam) 开发，你可以在 [`/server/ranzhi/`](https://github.com/easysoft/xuanxuan/tree/master/server/ranzhi) 目录下找到相关源代码。然之协同服务器部署请参考：[服务器部署指南](http://xuanxuan.chat/page/2.html)。

这里有一个公开的测试服务器供使用：

```
地址：https://demo.ranzhi.org/xuanxuan
用户：demo
密码：demo

或用户：demo1, demo2, ... demo10
密码：123456
```

注意：测试服务器不能使用传送文件功能。

### 客户端开发

客户端主要使用的技术为 `Webpack + Electron + React`。使用下面的步骤快速进入开发状态：

1. 下载源码：`git clone https://github.com/easysoft/xuanxuan.git`；
2. 在源码目录执行：`npm install`；
3. 启动 react hot server，执行：`npm run hot-server`；
4. 启动客户端，执行：`npm run start-hot`。

执行 `npm run package` 进行客户端打包。

## 许可证

喧喧使用 [ZPL](https://github.com/easysoft/xuanxuan/blob/master/LICENSE) 开源许可证，另外还使用了如下开源项目：

* [Electron](http://electron.atom.io/)、[React](https://facebook.github.io/react/)、[Webpack](https://webpack.github.io)：跨平台客户端开发支持；
* [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate)：提供项目模板；
* [EmojiOne](http://emojione.com/)：提供 Emoji 表情及图片资源支持；
* [Material UI](http://www.material-ui.com/)：提供部分界面控件框架；
* 其他重要开源项目包括：[draft.js](https://facebook.github.io/draft-js/)、[Babel](https://babeljs.io/)、[Moment](https://momentjs.com/)、[marked](https://github.com/chjj/marked)、[ion.sound](https://github.com/IonDen/ion.sound) 等。


