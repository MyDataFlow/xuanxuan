# Xuanxuan

http://xuan.im

proudly presented by [Zdoo](http://www.zdoo.org/) and an IM solution for enterprises.

Know more about the development plans of Xuanxuan：http://xuan.5upm.com/product-browse-1.html

![Xuanxuan](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/preview.png)

## Latest Update

🎉 Version 1.3 has added the long-anticipated extension mechanisms which provide more flexible ways to integrate your business with Xuanxuan. It also added several practical features, such as search chat history, dismiss chat group, check contacts by departments or roles,  and change password.

🎉 Dark theme has been built in the extension mechanism. It is a brand new experience and let's try it!

![Xuanxuan](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/extensions/dark-theme-preview.png)

## Features

* **Chat**：Chat with any user on your server. Emojis, images, screenshots and files are all supported.
* **Open Source**：Source code is open. Communications of both the client and the server are encrypted and secured.
* **Chat Group**：Invite more users to join your group chat. Set it as public, so any user could join in.
* **Notification**：Integrated with your desktop and get notified of new messages.
* **Chat Management**：Set sticky chat, including group chat and publich group chat and never miss any great chat. Rename the chat group and set a whitelist and the privilege to view the chat history.
* **Contact List**：Profile and contact information of all users within an enterprise.
* **Cross-Platform Client**：Windows, Linux and Mac are supported，and a browser client is provided.
* **Lightweight Server**：Very convenient to integrate with [Zdoo](http://www.zdoo.org/).

## Use

### Desktop Client

Thanks to the cross-platform feature of Electron, Xuanxuan have Windows, MacOS and Linux versions.

Download：http://xuan.im/#downloads

Check [Xuanxuan Official User Guide](http://xuan.im/page/1.html) for more help.

### Browser Client

Visit：https://easysoft.github.io/xuanxuan/1.2.0/ for Xuanxuan browser cient.

Note：You have to deploy a Xuanxuan official authenticated certificate to use brower clients.

For more help, please visit [Xuanxuan Browser Client Deployment and User Guide](https://github.com/easysoft/xuanxuan/blob/master/doc/browser-usage.md)

### Server Client

Instant communication of Xuanxuan client with the server is done via `WebSocket`. Besides, `https` is used to get config, upload, and dowload files from the server.

```
+------------+                 +------------+            +----------------+
|  Xuanxuan  |---------------->|  Xuanxuan  |----------->|   Rangerteam   |
|   Client   | WebSocket/Https |   Server   | Http/Https |     Server     |
|  (PC/Mac)  |<----------------|   (xxd)    |<-----------| (Your Website) |
+------------+                 +------------+            +----------------+
```

API Reference of client and server：[API Doc](http://xuan.im/page/3.html). API of the server is open too, and you can use technologies that you are familiar with, such as node.js, go, and swift, to implement your server.

Xuanxuan default server use `go` to develop（AKA `xxd` ）, and you can find the source code in [`/server/xxd/`](https://github.com/easysoft/xuanxuan/tree/master/server/xxd) . xxd provides interfacee of `WebSocket` and `https` for clients.

`xxd` does not save or manage user information anad data, but uses http, a broader protocol, and another server（AKA `http`）to communicate. 这样你只需要在你自己的网站上开发一系列 `http` 接口即可为你的网站用户启用喧喧。

官方默认提供的 `http` 服务是基于开源协同办公软件 [然之协同](https://github.com/easysoft/rangerteam) 开发，你可以在 [`/server/ranzhi/`](https://github.com/easysoft/xuanxuan/tree/master/server/ranzhi) 目录下找到相关源代码。然之协同服务器部署请参考：[服务器部署指南](http://xuan.im/page/2.html)。

这里有一个公开的测试服务器供使用：

```
地址：https://demo.ranzhi.org
用户：demo
密码：demo

或用户：demo1, demo2, ... demo10
密码：123456
```

注意：测试服务器不能使用传送文件功能。

### Client Customization

客户端主要使用的技术为 `Webpack + Electron + React`。使用下面的步骤快速进入开发状态：

1. 下载源码：`git clone https://github.com/easysoft/xuanxuan.git`；
2. 在源码目录执行：`npm install`；
3. 启动 react hot server，执行：`npm run hot-server`；
4. 启动客户端，执行：`npm run start-hot`。

执行 `npm run package` 进行客户端打包。

详情请参考：[客户端开发者指南](https://github.com/easysoft/xuanxuan/blob/master/doc/client-developer.md)

### Customization

Refer to：https://github.com/easysoft/xuanxuan/blob/master/doc/extension.md

## License

Xuanxuan is under [ZPL](https://github.com/easysoft/xuanxuan/blob/master/LICENSE) and uses open source projects as follows,

* [Electron](http://electron.atom.io/)、[React](https://facebook.github.io/react/)、[Webpack](https://webpack.github.io)：跨平台客户端开发支持；
* [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate)：提供项目模板；
* [EmojiOne](http://emojione.com/)：提供 Emoji 表情及图片资源支持；
* 其他重要开源项目包括：[draft.js](https://facebook.github.io/draft-js/)、[Babel](https://babeljs.io/)、ß[marked](https://github.com/chjj/marked)、[ion.sound](https://github.com/IonDen/ion.sound) 等。


