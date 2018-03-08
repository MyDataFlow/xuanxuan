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

Visit：https://easysoft.github.io/xuanxuan/1.4.0/ for Xuanxuan browser cient.

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

`xxd` does not save or manage any user information or data, but uses http, a broader protocol, and another server（AKA `http`）to communicate. Therefore, all you hav to do is to develop interfaces of `http` on your site and your site users can use Xuanxuan.

 `http` provided by Xuanxuan is based on an open source collaborative tool [Zdoo](https://github.com/easysoft/rangerteam) and you can find its source code in [`/server/ranzhi/`](https://github.com/easysoft/xuanxuan/tree/master/server/ranzhi). For Zdoo server deployment, please refer to：[Zdoo Server Deployment Guide](http://xuan.im/page/2.html)。

Here is a demo on a public test server:

```
Adrdress：https://demo.ranzhi.org
User：demo
Password：demo

or User：demo1, demo2, ... demo10
Password：123456
```

Note：On a test server, it is not supported to transfer files.

### Client Customization

Main technologies used in Xuanxuan are `Webpack + Electron + React`. Follow the steps below and expidite your customization:

1. Download the source code：`git clone https://github.com/easysoft/xuanxuan.git`；
2. Run：`npm install`；
3. Start react hot server, and run：`npm run hot-server`；
4. Start Xuanuan client and run：`npm run start-hot`。

Run `npm run package` to package the client.

For more details, refer to：[Client Customization Guide For Developers](https://github.com/easysoft/xuanxuan/blob/master/doc/client-developer.md)

### Customization

Refer to：https://github.com/easysoft/xuanxuan/blob/master/doc/extension.md

## License

Xuanxuan is under [ZPL](https://github.com/easysoft/xuanxuan/blob/master/LICENSE) and uses open source projects as follows,

* [Electron](http://electron.atom.io/)、[React](https://facebook.github.io/react/), [Webpack](https://webpack.github.io)：provides cross-platform client development support；
* [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate)：provides project modules；
* [EmojiOne](http://emojione.com/)：provides Emoji and images；
* Others：[draft.js](https://facebook.github.io/draft-js/), [Babel](https://babeljs.io/), ß[marked](https://github.com/chjj/marked), [ion.sound](https://github.com/IonDen/ion.sound), etc.


