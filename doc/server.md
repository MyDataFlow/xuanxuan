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

然之协同服务器端部署基本步骤参见：http://xuan.im/page/2.html

## 其他服务器端实现

服务器端 API 同样是开放的，你可以使用自己熟悉的技术（例如 node.js、go、swift）实现自己的服务器端。
