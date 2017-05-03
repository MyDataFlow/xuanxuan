# xxd性能简单测试



## 1 测试概要

**测试环境**

客户机：Windown7 旗舰版 64位 / i5-5200U / 8G / 500G / 100Mbps

服务器：Ubuntu 14.04.5 LTS 64位 / G1610T /2G / 3T / 100Mbps

该测试仅仅是测试了xxd服务器本身，并没有与然之服务器进行数据交互。

***提示：*** 测试机与被测服务器在同一局域网进行，排除了网速限制及网络不稳定性。



## 2 测试内容及方法

**测试内容**

测试xxd服务器可接受的客户端在线数量以及并发数量

**测试方法**

测试服务器：

* 调整Linux服务器的ulimit 参数 `ulimit -HSn 65535`


* 对xxd进行编译`go build -o xxd main.go`。

* 在服务器中开启xxd的测试模式`./xxd -test true` ，该模式开启后不会和后台然之服务器进行通讯。

  ``` shell
  ./xxd -test true                               # 输出如下内容
  Server test model is [true] 
  Test token: [3c0398784ba70a3e457490eab4f76c6d] # 复制token值给测试客户端使用
  xuan xuan chat listen port:[11444]
  ```

测试客户端：

* 测试客户端的路径在 *xxd/test* 中，对客户端进行编译 `go build -o test *.go`

* 启动测试客户端 `./test -token "3c0398784ba70a3e457490eab4f76c6d" -addr "192.168.1.164:11444" -clientNum 5`

  ```shell
  ./test -token "d631c09d13132d58f3bd49760e5bb793" -addr "192.168.1.164:11444" -clientNum 5
  connecting to ws://192.168.1.164:11444/ws
  connecting to ws://192.168.1.164:11444/ws
  connecting to ws://192.168.1.164:11444/ws
  connecting to ws://192.168.1.164:11444/ws
  connecting to ws://192.168.1.164:11444/ws
  ```

  

## 3 测试结果

**并发测试**

测试客户端开启了2个，每个的clientNum为5000，每个客户端每秒连接数为10。

完成后服务器共连接了10000个客户端，每秒建立20个网络连接无问题。

10000个客户端 cpu使用率为5%，内存使用率为18%。



**同时在线测试**

并发测试完成后，再次开启一个测试客户端，clientNum为5000，每秒连接数为10。

完成后总共连接了15000个客户端。

15000客户端 cpu使用率为7%，内存使用率为32%。



***提示：*** 不同的测试环境得出的结果可能不同。
