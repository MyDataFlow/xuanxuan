# 客户端开发者指南

本文将指导你从零入手喧喧客户端开发。

## 技术准备

喧喧客户端使用到了如下关键技术：

* **[Electron](https://electron.atom.io/)**：（最初名为 Atom Shell）是 GitHub 开发一个的开源框架。它允许使用 Node.js（作为后端）和 Chromium（作为前端）完成桌面 GUI 应用程序的开发。Electron 现被已多个开源 Web 应用程序用于前端与后端的开发，著名项目包括 GitHub 的 [Atom](https://atom.io/) 和微软的 [Visual Studio Code](https://code.visualstudio.com/)；
* **[NodeJS](https://nodejs.org/)**：一个基于Chrome V8 引擎的 JavaScript 运行时；
* **[npm](https://www.npmjs.com/)**：作为 nodejs 内置的包管理器；
* **[ES6](http://es6.ruanyifeng.com/)**：（全称 ECMAScript 6.0） 是 JavaScript 语言的下一代标准，已经在2015年6月正式发布了；
* **[React](https://facebook.github.io/react/)**：一个为数据提供渲染为 HTML 视图的开源前端库；
* **[Webpack](https://webpack.js.org/)**：前端资源模块化管理和打包工具。

如果你了解以上一个或多个技术，以下内容你可以选择性的阅读以更快的进入喧喧开发状态；如果你是第一次接触这些内容也没有关系，这篇指南仍然可以带你将喧喧跑起来。

## 快速开始

如果你是 nodejs 开发老手，请了解如下关键命令，并且跳过下面的 _详细步骤_ 章节。

```bash
$ git clone https://github.com/easysoft/xuanxuan.git
$ cd xuanxuan/xxc
$ npm install
$ npm run hot-server

# 新开一个命令行窗口执行
$ npm run start-hot
```

## 详细步骤

下面的内容适合新手，包含详细步骤和注意事项。

### 1. 安装 Nodejs 和 npm

访问 Nodejs 官网下载并安装 nodejs，选择一个适合你的操作系统的安装包，按照官方提示安装即可。虽然不同的 nodejs 版本都可以运行喧喧，但可能需要额外的配置，建议你下载与喧喧开发者相同版本的 nodejs 版本。喧喧开发人员目前使用的 nodejs 环境版本是 **`7.8.0`**，可以在这个页面 https://nodejs.org/zh-cn/download/releases/ 找到对应版本的下载地址。

Windows 和 Mac 系统用户可以直接下载非常方便的一键安装包，安装完成后打开命令行窗口（Mac 下为应用 “终端”，Windows 下为程序 “命令提示符” 或 “PowerShell”）输入如下命令查询安装后的版本号，如果输出正确版本号说明安装成功。

```
$ node -v
```

输出：

```
v7.8.0
```

如果 nodejs 安装成功，npm 也会一起安装完成，输入 `npm -v` 来检查已安装的 npm 版本。

```
$ npm -v
```

输出：

```
4.2.0
```

### 2. 下载喧喧源码

如果你的系统安装有 git，只需要在命令行执行如下命令来下载最新版的喧喧源码：

```
$ git clone https://github.com/easysoft/xuanxuan.git
```

下载完成后就会在你的系统创建一个名称为 `xuanxuan` 的目录，该目录内就是喧喧最新的源码，其中客户端源码在 `xxc` 目录，以下所有操作都是在 `xxc` 目录下进行。

```
$ cd xuanxuan/xxc
```

如果你还没有安装或使用过 [git](https://git-scm.com/) 也不用担心，你仍然可以访问 [喧喧在 Github 上的页面](https://github.com/easysoft/xuanxuan)，直接点击 [“Download ZIP”](https://github.com/easysoft/xuanxuan/archive/master.zip) 来下载源码。下载完成后将 zip 文件解压到 `xuanxuan` 目录下即可。

### 3. 安装项目依赖

从命令行进入下载好的喧喧源码目录（以下默认为 `xuanxuan/`），执行如下命令：

```
$ npm install
```

#### 安装失败？

此步骤通常需要几分钟，视网络环境执行的时间不定。如果你使用的是国内网络，可能导致某些依赖模块安装失败。下面介绍使用国内 **[淘宝 NPM 镜像](https://npm.taobao.org/)** 来加速安装过程，确保安装成功。以下经验适合任何基于 nodejs 的项目。

##### 将镜像地址写入 `~/.npmrc`

在你的系统找到 `~/.npmrc` 文件，并用文本编辑器打开，写入如下内容到文件：

```
registry=https://registry.npm.taobao.org/
disturl=https://npm.taobao.org/dist
```

**注意**：`.npmrc` 文件在系统的个人文件目录下，在不同的操作系统上对应的路径不同，Windows 用户通常次文件在 `C:/Users/UserName/.npmrc`，Mac 用户通常此文件在 `/Users/UserName/.npmrc`。

写好配置后可以使用 `npm info` 命令检查下是否生效，以下为查看 [ZUI](http://zui.sexy) 为例：

```
$ npm info zui
```

如果在命令行输出信息的结尾找到 ZUI 的下载地址为 `registry.npm.taobao.com`，说明配置生效了。

```
dist:
    { shasum: '134f986bc53a62be2310a0438918b8a17b58c80c',
        size: 9957159,
        noattachment: false,
     tarball: '**http://registry.npm.taobao.org/zui/download/zui-1.6.0.tgz**' },
  publish_time: 1489730305654 }
```

这样再次执行 `npm install` 命令就可以使用国内的淘宝镜像进行依赖模块的安装了。

#### 安装 Electron 失败？

##### 设置 ELECTRON_MIRROR 环境变量

设置 Electron 环境变量，在 Mac 或 Linux 下执行：

```
$ export ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/"
```

Windows 用户需要打开系统属性面板来设置环境变量（变量名称为 `ELECTRON_MIRROR`，值为 `https://npm.taobao.org/mirrors/electron/`）。

做了如上设置后，请重新执行 `npm install`。
Windows 用户注意，设置新的环境变量之后需要重新打开一个命令行窗口，所设置的环境变量才会生效。

##### 单独安装 Electron

如果仍然遇到问题，你可以尝试单独先安装 Electron，Mac 或 Linux 用户执行：

```
ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/" npm install electron
```

Windows 用户无法运行上面的命令，仍然

```
$ npm install cross-env -g
```

然后再执行：

```
cross-env ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/" npm install electron
```

这样就可以强制从淘宝镜像安装 Electron。

#### 其他资源

如果你还有其他问题，请参考如下内容：

* [npm taobao 镜像官方网站](https://npm.taobao.org/)；
* [加速electron在国内的下载速度](http://blog.tomyail.com/install-electron-slow-in-china/)；
* [使用淘宝 NodeJS 镜像加速 Electron Node-Sass 的安装速度](http://zqlu.github.io/2016/05/10/taobao-nodejs-mirror/)；
* [安装node和npm并切换淘宝npm镜像源](https://blog.skyx.in/archives/206/)。

### 4. 启动开发服务器

如果你最后一次执行 `npm install` 没有出现任何错误，就可以启动开发服务器了。

#### 启动 React 热更新服务器

在命令行窗口执行如下命令：

```
$ npm run hot-server
```

如果你在命令行窗口看到如下内容，说明 React 热更新服务器成功启动：

![npm run hot-server 运行成功截图](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/npm_run_hot-server.png)

热更新服务器用于监听源码文件更改，当你更改了源码之后会立即重新编译并通知界面组件进行刷新。这是一种所见即得的开发模式，也就是说你在源代码中的更改会即时反馈到界面上来。

**注意**：只有 React 组件模块会直接中界面上更新，如果是其他模块虽然仍然会实时编译，但并不会进行实时更换，此时你可以在界面上按页面刷新快捷键（Windows 为 `F5`，Mac 用户为 `Command+R`）来重新载入界面。

#### 启动客户端

打开一个新的命令行窗口（不要关闭之前打开的正在运行的热更新服务器命令行窗口）执行：

```
$ npm run start-hot
```

如果你在命令行窗口看到如下内容，说明客户端启动成功：

![npm run start-hot 运行成功截图](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/npm_run_start-hot.png)

#### 首次启动时间过长

当首次执行 `npm run start-hot` 时，Electron 会尝试下载安装 `REACT_DEVELOPER_TOOLS` 方便进行 React 开发调试，此时命令行会显示 `Install electron development extensions...`。正常情况下只需要几分钟，但在网络不佳的话可能导致首次启动时间过长。如果超过5分钟主界面还没启动，可以尝试禁用自动安装 Electron 扩展，方法是使用 `npm run start-hot-fast` 代替 `npm run start-hot` 命令。

#### 恭喜

通常情况下，如果以上步骤都成功，此时会在你的屏幕左侧打开一个新的窗口：窗口上方是喧喧的界面，下方是 Chrome 的开发者工具。

![成功启动客户端](https://raw.githubusercontent.com/easysoft/xuanxuan/master/doc/img/debug.png)

## 打包

### 正常打包

任何时候执行如下命令可以为所在平台（Windows 用户打包 Windows 安装包，Mac 用户打包 Mac dmg 安装镜像）打包喧喧安装程序：

```
$ npm run package
```

对于 Windows 用户，默认情况下，如果你的系统是 64 位，则打包的是 Windows 64 位版本，如果你的系统是 32 位，则打包的是 32 位安装包，如果你需要在 Windows 64 位系统上打包 32 位版本，则需要执行：

```
$ npm run package-win-32
```

### 打包调试版本

执行如下命令，可以打包一个**调试版本**方便用户安装并进行调试：

```
$ npm run package-debug
```

调试版会像开发模式启动的客户端一样在界面下方显示 Chrome 的开发者工具，并且不会忽略所有调试消息。

### 跨平台打包（仅适合 Mac 用户）

如果你是 Mac 用户，除了可以打包 Mac 安装镜像，还可以打包 Windows 安装包和 Linux 安装包，这样实现在一个平台上打包所有平台版本。

确保你的系统安装了 [brew](http://brew.sh/) 来安装跨平台打包的依赖工具。

执行如下命令为打包 Windows 版本做准备：

```
$ brew install wine --without-x11
$ brew install mono
```

执行如下命令为打包 Linux 版本做准备：

```
$ brew install gnu-tar graphicsmagick xz
```

如果你还需要构建 Linux rpm 包，则需要安装 rpm：

```
$ brew install rpm
```

完善上述步骤之后就可以使用如下命令来构建所需的平台版本了：

<table>
  <thead>
    <tr>
      <th>命令</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>npm run package-win</code></td>
      <td>打包 Windows 64 位版本</td>
    </tr>
    <tr>
      <td><code>npm run package-win-32</code></td>
      <td>打包 Windows 32 位版本</td>
    </tr>
    <tr>
      <td><code>npm run package-linux</code></td>
      <td>打包 Linux 64 位版本</td>
    </tr>
    <tr>
      <td><code>npm run package-linux-32</code></td>
      <td>打包 Linux 32 位版本</td>
    </tr>
    <tr>
      <td><code>npm run package-win-debug</code></td>
      <td>打包 Windows 64 位**调试**版本<</td>
    </tr>
    <tr>
      <td><code>npm run package-browser</code></td>
      <td>打包浏览器版本<</td>
    </tr>
    <tr>
      <td><code>npm run package-all</code></td>
      <td>同时打包除所有平台上的版本</td>
    </tr>
  </tbody>
</table>

## 源码结构

下面简单介绍喧喧源码（假设以下根目录为 `xuanxuan/`）各个目录及文件内容：

<table>
  <thead>
    <tr>
      <th>目录</th>
      <th>介绍</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/xxc/</code></td>
      <td>客户端项目</td>
    </tr>
    <tr>
      <td><code>/xxc/app/</code></td>
      <td>客户端源代码</td>
    </tr>
    <tr>
      <td><code>/xxc/app/assets/</code></td>
      <td>客户端使用到的第三发静态资源目录</td>
    </tr>
    <tr>
      <td><code>/xxc/app/media/</code></td>
      <td>客户端上用到的图片、语音及表情资源</td>
    </tr>
    <tr>
      <td><code>/xxc/app/lang/</code></td>
      <td>客户端语言配置文件目录，目前只有中文简体文件 `zh-cn.json</td></td>
    </tr>
    <tr>
      <td><code>/xxc/app/style/</code></td>
      <td>客户端界面样式表文件目录，通常为 Less 文件</td>
    </tr>
    <tr>
      <td><code>/xxc/app/utils/</code></td>
      <td>客户端用到的工具组件</td>
    </tr>
    <tr>
      <td><code>/xxc/app/network/</code></td>
      <td>客户端内部与网络相关的接口模块</td>
    </tr>
    <tr>
      <td><code>/xxc/app/config/</code></td>
      <td>客户端配置文件</td>
    </tr>
    <tr>
      <td><code>/xxc/app/platform</code></td>
      <td>客户端与平台相关的模块</td>
    </tr>
    <tr>
      <td><code>/xxc/app/core/</code></td>
      <td>客户端核心模块</td>
    </tr>
    <tr>
      <td><code>/xxc/app/components/</code></td>
      <td>客户端界面用到的通用 React 组件</td>
    </tr>
    <tr>
      <td><code>/xxc/app/views/</code></td>
      <td>客户端界面 React 视图组件</td>
    </tr>
    <tr>
      <td><code>/xxc/app/main.development.js</code></td>
      <td>Electron 入口文件</td>
    </tr>
    <tr>
      <td><code>/xxc/app/index.html</code></td>
      <td>主窗口 HTML 代码文件</td>
    </tr>
    <tr>
      <td><code>/xxc/app/index.js</code></td>
      <td>Electron 主窗口入口代码文件</td>
    </tr>
    <tr>
      <td><code>/xxc/resources/</code></td>
      <td>Electron 打包时用到的资源文件目录</td>
    </tr>
    <tr>
      <td><code>/xxc/build/</code></td>
      <td>Webpack 配置文件，开发模式脚本以及 Electron 安装包构建相关脚本</td>
    </tr>
    <tr>
      <td><code>/xxb/</code></td>
      <td>后端服务器源代码目录</td>
    </tr>
    <tr>
      <td><code>/xxd/</code></td>
      <td>XXD 中间服务器端源代码目录</td>
    </tr>
    <tr>
      <td><code>/ranzhi</code></td>
      <td>然之协同服务器端扩展源代码目录</td>
    </tr>
  </tbody>
</table>

## 其他

如果你遇到针对此指南或者喧喧开发过程中任何问题，欢迎加入 QQ 群 **367833155** 讨论。
