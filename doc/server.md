# 服务器端下载及使用

服务器部署分为然之协同和xxd两部分。

## 部署然之协同服务器端

1.下载安装然之协同最新版：[http://www.ranzhico.com/download.html](http://www.ranzhico.com/download.html) ；

2.以管理员身份登录然之，进入后台 -> 系统 -> 喧喧 ，设置一个长度为32的密钥，并将这个密钥并告诉 xxd 服务器管理员；

3.服务器的登录地址为 xxd 的访问地址，登录帐号和密码为然之协同内对应用户的帐号和密码；

4.调试时设置 ranzhi/config/my.php 中 debug=true，在 ranzhi/tmp/log/xuanxuan.log.php 中查看日志。

## 部署xxd

1.下载对应的xxd服务器版本，并解压缩。

| 操作系统       | 64位                                      | 32位                                      |
| :--------- | :--------------------------------------- | ---------------------------------------- |
| Windows 7+ | [xxd-1.1.1-win64.zip](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.1-win64.zip) | [xxd-1.1.1-win32.zip](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.1-win32.zip) |
| Mac OS10+  | [xxd-1.1.1-mac.tar.gz](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.1-mac.tar.gz) |                                          |
| Linux      | [xxd-1.1.1-linux-x64.tar.gz](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.1-linux-x64.tar.gz) | [xxd-1.1.1-linux-ia32.tar.gz](http://dl.cnezsoft.com/xuanxuan/1.1/xxd-1.1.1-linux-ia32.tar.gz) |

2.修改目录中的config文件

根据自己网络环境的情况对服务器的配置文件进行修改，路径为 *config/xxd.conf* ，说明如下：

```ini
[server]
# 监听的服务器ip地址
ip=192.168.1.164

# 与聊天客户端通讯的端口
chatPort=11444

# 是否启用https , 设置为0则使用http协议 1为https协议
isHttps=1

# 通用端口，该端口用于客户端登录时验证，以及文件上传下载使用
commonPort=11443

# 上传文件的保存路径，最后的“/”不能省略，表示路径
uploadPath=tmpfile/

# 上传文件的大小，支持：K,M,G
uploadFileSize=32M

[ranzhi]
# xuanxuan和ranzhiName是自定义然之服务器名称，客户端登录时需要
# token从然之服务器中获取，长度为32个字符
# 设置某个服务器为default后，客户端省略服务器名称时默认使用default
# 地址格式为http[s]://addr/path/xuanxuan.php,token[,default]
# ranzhiName=http[s]://ip:port/xuanxuan.php,tokenID8888888888888888888888888
xuanxuan=http://192.168.1.164:8188/xuanxuan.php,88888888888888888888888888888888,default

# NOTE: Windows accept / as path separator.
[log]
# 程序运行日志的保存路径
logPath=log/

[certificate]
# 证书的保存路径，默认情况下xxd会生成自签名证书
crtPath=certificate/
```

配置文件完成后就可以启动服务器。

3.启动服务器

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
运行xxd后会在xxd当前目录生成`certificate`文件夹,服务会自动生成两个证书`main.key`和`main.crt`
这两个证书为自己生成,浏览器可能会拦截
将购买的受信任的证书直接替换即可,注意证书的格式和名称

