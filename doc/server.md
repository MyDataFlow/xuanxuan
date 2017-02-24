# 服务器端下载及使用

## 然之协同服务器

当前已提供的服务器端（在 `/server` 目录下）是基于 [然之协同](https://github.com/easysoft/rangerteam) 使用 [php socket](http://php.net/manual/en/book.sockets.php) 方案实现。

这里有一个公开的测试服务器供使用：

```
地址：http://demo.ranzhi.org
用户：demo
密码：demo

或用户：demo1, demo2, ... demo10
密码：123456
```

注意：测试服务器不能使用传送文件功能。

然之协同服务器端部署基本步骤：

1. 下载安装然之协同：[http://www.ranzhico.com/download.html](http://www.ranzhico.com/download.html)；
2. 下载喧喧然之协同服务器端 [xuanxuan-server-rangerteam-1.0.0.zip](http://dl.cnezsoft.com/xuanxuan/xuanxuan-server-rangerteam-1.0.0.zip) 并解压缩至 `server` 目录；
3. 合并 `server` 目录到然之协同服务目录；
4. 导入 `server/db/xuanxuan.sql` 到然之协同的数据库；
5. 修改 `php.ini`，确保 php 在 webserver 模式和 cli 模式下的 `session.save_path` 指向同一目录；
6. Linux 或 Mac 系统在然之服务目录执行 `sudo -u username ./app/xuanxuan/server.php`，其中 `username` 为然之协同 Apache 服务运行用户；Windows 系统在然之服务目录执行 `x:\xxx\php.exe ./app/xuanxuan/server.php`，其中 `x:\xxx\php.exe` 为php安装路径。

## 其他服务器端实现

服务器端 API 同样是开放的，你可以使用自己熟悉的技术（例如 node.js、go、swift）实现自己的服务器端。
