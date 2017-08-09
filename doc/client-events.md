# 客户端开发之事件和状态

## User

所有用户状态定义在 `Member.STATUS`，包括：

```js
{
    unverified:   0,   // 未登录
    logining:     1,   // 正在登录
    reconnecting: 2,   // 正在重连
    disconnect:   3,   // 登录过，但掉线了
    logined:      4,   // 登录成功
    online:       5,   // 在线
    busy:         6,   // 忙碌
    away:         7,   // 离开
}
```

所有可用事件可以在 `User.EVENT` 对象中找到。

* `config_change`: 用户配置变更事件：
  - `change`：发生变更的配置项
  - `config`：配置管理对象
  - `user`：发生配置变更的用户对象
* `status_change`: 用户状态发生变化：
  - `status`：新的状态；
  - `oldStatus`：旧的状态；

## Socket

所有用户状态定义在 `Platform.Socket.STATUS`，包括：

```js
{
    CONNECTING:	0,	// 连接还没开启。
    OPEN:	      1,	// 连接已开启并准备好进行通信。
    CLOSING:	  2,	// 连接正在关闭的过程中。
    CLOSED:	    3,	// 连接已经关闭，或者连接无法建立。
    UNCONNECT:  4,  // 未连接
}
```

所有可用事件可以在 `Platform.Socket.EVENT` 对象中找到。

* `data`: 接收到数据：
  - `socket`：Socket 对象；
  - `data`：接收到的数据；
  - `flags`：数据标志信息；
* `close`: 关闭：
  - `socket`：Socket 对象；
  - `code`：关闭代码；
  - `reason`：关闭理由；
* `error`: 发生了错误：
  - `socket`：Socket 对象；
  - `error`：错误对象；
* `connect`: 连接成功：
  - `socket`：Socket 对象；
* `status_change`: 状态变更：
  - `socket`：Socket 对象；
  - `newStatus`：新的状态
