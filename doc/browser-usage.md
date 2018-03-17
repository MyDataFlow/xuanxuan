# 喧喧浏览器端

## 使用

喧喧从1.2版本起提供了浏览器端版本，直接访问下面的网址的一个就可以连接到你的喧喧服务器：

* https://easysoft.github.io/xuanxuan/1.4.0/
* https://demo.ranzhi.net/

通常浏览器对<a href="https://developer.mozilla.org/zh-CN/docs/Security/MixedContent" target="_blank">混合内容</a>会进行限制访问，喧喧浏览器端版本也受此限制：

* 如果你使用的喧喧浏览器版本是使用 https 协议访问的，则你只能连接到仅支持 https 访问的喧喧服务器，且你的喧喧服务器必须使用官方安全证书；
* 如果你使用的喧喧浏览器版本是使用 http 协议访问的，则你只能连接到仅支持 http 访问的喧喧服务器，此时你与喧喧服务器到连接是不安全的，加密功能会失效；

喧喧浏览器版本目前仅支持最新版本的 Chrome 浏览器，其他浏览器版本将在后续版本中兼容。

## 自行部署

除了使用上面提供的已部署的浏览器版本，你还可以将喧喧浏览器版本部署到你自己的服务器：

1. 下载 [xuanxuan.1.4.0.browser.zip](http://dl.cnezsoft.com/xuanxuan/1.4/xuanxuan.1.4.0.browser.zip) 浏览器版本部署所需的所有文件；
2. 讲文件解压后上传到你的 https（或http）服务器，你可以将这些文件上传到任何类型的服务器，实际上这里仅仅需要一个静态站点；
3. 使用 https（或 http）协议访问访问上传后的 index.html 即可。
