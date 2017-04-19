# Xxd服务器管理员使用说明

## 1 Xxd服务器配置说明

根据自己网络环境的情况对服务器的配置文件进行修改，路径为*config/xxd.conf* ，说明如下：

```ini
# 服务器配置
[server]
# 监听的服务器ip地址
ip=192.168.84.128

# 与聊天客户端通讯的端口
chatPort=1129

# 通用端口，该端口用于客户端登录时验证，以及文件上传下载使用
commonPort=11443

# 上传文件的保存路径，最后的“/”不能省略，表示路径
uploadPath=tmpfile/

# 与然之服务器相关配置
[ranzhi]
# ranzhiName1和2是自定义然之服务器名称，客户端登录时需要。
# 后面的地址格式为http(s)://addr/path,token
# token从然之服务器中获取，长度为32个字符
ranzhiName1=http://192.168.84.128:8282/ranzhi,tokenID8888888888888888888888888
ranzhiName2=http(s)://ip:port/ranzhi,tokenID8888888888888888888888888

# NOTE: Windows accept / as path separator.
[log]
# 程序运行日志的保存路径
logPath=log/

[certificate]
# 证书的保存路径，默认情况下程序会生成自签名证书
crtPath=certificate/
```

配置文件完成后就可以启动服务器

## 2 启动服务器

### Linux平台

执行以下命令，启动服务器

```shell
./xxd
```

若启动失败，请查看log目录下面的日志文件，按照提示解决问题。

需要开机启动和后台执行，请把启动命令加入到*/etc/rc.d/rc.local*文件的最后

```shell
# rc.local
/xxdPath/xxd &

```



### Windows平台

在命令终端中执行`./xxd.exe`启动服务器，若启动失败，请查看log目录下面的日志文件，按照提示解决问题。

需要开机启动和后台执行的，请把启动命令加入到计划任务中