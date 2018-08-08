# 服务器端下载及使用

服务器部署分为web端和xxd两部分。


## 部署web端

只需要部署"然之服务器端"或者"XXB独立服务器端"任意一个即可

### 然之协同服务器端

1. 下载安装然之协同最新版：[http://www.ranzhico.com/download.html](http://www.ranzhico.com/download.html) ；
2. 下载升级包：[http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan-ranzhi.1.4.0.zip](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan-ranzhi.1.4.0.zip) ，解压并覆盖然之；
3. 在数据库中执行 db/upgradexuanxuan1.3.0.sql；
4. 以管理员身份登录然之，进入后台 -> 系统 -> 喧喧 ，设置一个长度为32的密钥，在xxd的config目录下配置文件中设置同样的密钥；
5. 服务器的登录地址为 xxd 的访问地址，登录帐号和密码为然之协同内对应用户的帐号和密码；
6. 调试时设置 ranzhi/config/my.php 中 debug=true，在 ranzhi/tmp/log/xuanxuan.log.php 中查看日志。

### XXB独立服务器端

XXB主要用途是将然之会员管理模块独立成一个新的管理后台。

1. 下载安装XXB最新版：
  * 源码：[源码包](http://dl.cnezsoft.com/xuanxuan/1.4/xxb.1.0.zip)；
  * Windows：[Windows 64位一键安装包](http://dl.cnezsoft.com/xuanxuan/1.4/xxb.1.0.win_64.exe)、[Windows 32位一键安装包](http://dl.cnezsoft.com/xuanxuan/1.4/xxb.1.0.win_32.exe)
  * Linux：[Linux 64位一键安装包](http://dl.cnezsoft.com/xuanxuan/1.4/xxb.1.0.zbox_64.tar.gz)、[Linux 32位一键安装包](http://dl.cnezsoft.com/xuanxuan/1.4/xxb.1.0.zbox_32.tar.gz)、[Linux rpm安装包](http://dl.cnezsoft.com/xuanxuan/1.4/xxb-1.0-1.noarch.rpm)、[Linux deb安装包](http://dl.cnezsoft.com/xuanxuan/1.4/xxb-1.0.deb)；
2. 以管理员身份登录XXB，进入设置 ，设置一个长度为32的密钥，在xxd的config目录下配置文件中设置同样的密钥；
3. 服务器的登录地址为 xxd 的访问地址，登录帐号和密码为系统内用户的帐号和密码；
4. 调试时设置 xxb/config/my.php 中 debug=true，在 xxb/tmp/log/xuanxuan.log.php 中查看日志。


## 部署xxd

### 1.下载对应的xxd服务器版本，并解压缩。

| 操作系统       | 64位                                      | 32位                                      |
| :--------- | :--------------------------------------- | ---------------------------------------- |
| Windows 7+ | [xxd.1.4.0.win64.zip](http://dl.cnezsoft.com/xuanxuan/1.4/xxd.1.4.0.win64.zip) | [xxd.1.4.0.win32.zip](http://dl.cnezsoft.com/xuanxuan/1.4/xxd.1.4.0.win32.zip) |
| Mac OS10+  | [xxd.1.4.0.mac.tar.gz](http://dl.cnezsoft.com/xuanxuan/1.4/xxd.1.4.0.mac.tar.gz) |                                          |
| Linux      | [xxd.1.4.0.linux.x64.tar.gz](http://dl.cnezsoft.com/xuanxuan/1.4/xxd.1.4.0.linux.x64.tar.gz) | [xxd.1.4.0.linux.ia32.tar.gz](http://dl.cnezsoft.com/xuanxuan/1.4/xxd.1.4.0.linux.ia32.tar.gz) |

### 2.修改目录中的config文件

根据自己网络环境的情况对服务器的配置文件进行修改，路径为 *config/xxd.conf* ，说明如下：

```ini
[server]
# 监听的服务器ip地址。
# ip地址应该填写服务器的内网ip，生产环境请勿使用127.0.0.1。如果使用127.0.0.1，客户端只能通过127.0.0.1登录。
ip=127.0.0.1

# 与聊天客户端通讯的端口。
chatPort=11444

# 通用端口，该端口用于客户端登录时验证，以及文件上传下载使用。
commonPort=11443

# 是否启用https，设置为0使用http协议，设置为1使用https协议。客户端登陆时http协议要和此处设置保持一致。
# 如果启用https，xxd默认使用自己生成的证书。如果要通过浏览器访问，则需要使用官方认证的证书替换证书保存路径(证书保存路径在配置文件最后配置)下的证书。替换的证书要和原来的证书名保持一致。
# 如果将此项设置为 0，则加密会失效，强烈建议在生产环境设置为 1。
isHttps=1

# 上传文件的保存路径，最后的“/”不能省略，表示路径。
# 注意：Windows下路径中的‘\’需要转义写成‘\\’，例如‘D:\xxd\files’要写成‘D:\\xxd\\files’。
uploadPath=tmpfile/

# 上传文件的大小，支持：K,M,G。
uploadFileSize=32M

# 在线用户上限限制，0为不限制
maxOnlineUser=0

[ranzhi]
# xxd是一台消息转发服务器，可以连接到多个后端服务器。后端服务器配置信息格式如下([]表示此内容为选填项)：
#
# 服务器名称=传输协议://请求地址[:端口][/目录名称]/入口文件,密钥[,是否默认服务器]
#
# 服务器名称：必填。只能使用英文字母。可以配置多个后端服务器，客户端登录时根据服务器名称区分连接到哪个后端服务器。
# 传输协议：必填。http 或者 https。此处的传输协议是xxd通过http请求连接到后端服务器时使用，使用哪种传输协议取决于后端服务器的配置，与上文中的isHttps配置无关。
# 请求地址：必填。后端服务器的请求地址，可以是域名或者ip。根据后端服务器的配置不同，可能需要添加目录名称。
# 端口：选填。默认使用80端口时可以不填写，否则需要填写端口。
# 目录名称：选填。如果后端服务器配置的域名或者ip没有指向入口文件所在的目录，则必须添加目录名称。
# 入口文件：必填。入口文件指xxd连接的后端服务器处理xxd请求的入口文件，固定为xuanxuan.php。
# 密钥：必填。xxd和后端服务器通信的密钥，需要和后端服务器中的设置保持一致。
# 是否默认服务器：选填。是默认服务器时填写default，否则不用填写。如果只配置了一台后端服务器，必须填写。如果客户端的登录地址不填写后端服务器名称，则连接到默认的后端服务器。
#
# 如果配置了多个后端服务器，则要保证xxd到每个后端服务器的网络连接都是通的，否则xxd无法启动。
#
# 下面是后端服务器的配置示例：
localhost=http://127.0.0.1/xxb/xuanxuan.php,88888888888888888888888888888888,default
# xuanxuan=http://192.168.1.100/xxb/xuanxuan.php,88888888888888888888888888888888
# ranzhi=http://demo.ranzhi.net/xuanxuan.php,88888888888888888888888888888888

[log]
# 程序运行日志的保存路径。
logPath=log/

[certificate]
# 证书的保存路径，默认情况下xxd会生成自签名证书。
crtPath=certificate/
```

配置文件完成后就可以启动服务器。

**注意**：为确保喧喧加密机制生效，`isHttps` 必须设置为 `1`，并且需要使用更加安全的 Token（不使用默认值）。

### 3.启动服务器

**Linux平台**

执行以下命令，启动服务器：

```shell
./xxd
```

若启动失败，请查看log目录下面的日志文件，按照提示解决问题。

需要开机启动和后台执行，请把启动命令加入到 */etc/rc.d/rc.local* 文件的最后。

```shell
# rc.local
/xxdPath/xxd &
```

**Windows平台**

在命令终端中执行`./xxd.exe`启动服务器，若启动失败，请查看log目录下面的日志文件，按照提示解决问题。

需要开机启动和后台执行的，请把启动命令加入到计划任务中。

**证书配置**

运行xxd后会在xxd当前目录生成`certificate`文件夹,服务会自动生成两个证书`main.key`和`main.crt`这两个证书为自己生成,浏览器可能会拦截

将购买的受信任的证书直接替换即可,注意证书的格式和名称

### 4.后台统一管理扩展
**然之**
登录然之管理系统->后台管理->应用
添加(修改)应用
``平台``中勾选``喧喧``,设置``版本号``
上传``附件``，附件支持.zip或.xext，文件结构及内容请参考【[扩展机制](http://xuan.im/page/extensions.html)】

**XXB**
登录XXB->应用
添加(修改)应用
设置``版本号``
上传``附件``，附件支持.zip或.xext，文件结构及内容请参考【[扩展机制](http://xuan.im/page/extensions.html)】


### 5.升级XXB或服务端扩展
将xxb(然之喧喧扩展包或禅道喧喧扩展包)源码包解压覆盖。
然后访问``http://siteURL/upgradexuanxuan.php``根据提示完成升级即可。

