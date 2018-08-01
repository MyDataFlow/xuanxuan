# 服务器端API
服务器端 API 是开放的，你可以使用自己熟悉的技术（例如 node.js、go、swift）实现自己的服务器端。

请参考以下 API 设计来开发自己的服务器端。

## 数据库设计参考

MySql 数据库参见 https://github.com/easysoft/xuanxuan/blob/master/ranzhi/db/xuanxuan.sql

### Chat 表

存储会话数据。

| 名称             | 类型       | 必须/可选 | 说明                                       |
| :------------- | :------- | :---: | :--------------------------------------- |
| id             | number   |  必须   | 存储在远程数据库的id,客户端根据此id值是否设置来判定是否为远程保存的对象   |
| gid            | string   |  必须   | 当客户端向系统提交新的会话时,会创建全局唯一的id                |
| name           | string   |  可选   | 会话名称,当为空时,客户端会自动生成会话名称                   |
| type           | string   |  可选   | 表明会话类型：system(系统), one2one(一对一), gourp（多人讨论组）, project, product等 |
| admins         | string   |  可选   | 会话管理员用户列表                                |
| committers     | string   |  可选   | 会话允许发言用户清单                               |
| subject        | int      |  可选   | 主题会话关联的主题(product, project等)ID           |
| public         | bool     |  可选   | 是否公共会话                                   |
| createdBy      | string   |  必须   | 创建者的账号                                   |
| createdDate    | datetime |  必须   | 创建会话时服务器的时间戳                             |
| editedBy       | string   |  可选   | 编辑者的账号                                   |
| editedDate     | datetime |  可选   | 编辑会话时服务器的时间戳                             |
| lastActiveTime | datetime |  可选   | 会话最后一次发送消息时服务器的时间戳                       |
| [users]        | 关联数据集    |  必须   | 包含此会话的所有成员,和每个成员加入此会话的时间                 |
| [messages]     | 关联数据集    |  必须   | 包含此会话的所有消息                               |

### Message 表

存储会话消息数据。

| 名称          | 类型     | 必须/可选 | 说明                                       |
| :---------- | :----- | :---: | ---------------------------------------- |
| id          | number |  必须   | 存储在远程数据库的id,客户端根据此id值是否设置来判定是否为远程保存的对象   |
| gid         | string |  必须   | 当客户端向系统提交新的消息时,会创建全局唯一的id                |
| cgid        | string |  必须   | 此消息所属于的会话的gid属性,会话根据此值来查询包含的消息           |
| user        | string |  可选   | 此消息发送者的用户名,广播类的消息没有此值                    |
| date        | number |  必须   | 消息发送的时间戳                                 |
| type        | string |  可选   | 消息的类型,为'normal'（默认）, 'broadcast'         |
| content     | string |  必须   | 消息的内容,如果消息内容类型不是文本,则已此值为json格式的对象        |
| contentType | string |  必须   | 消息内容的类型,为'text'(默认), 'emoticon', 'image', 'file' |


### UserMessageStatus

记录消息状态。

| 名称      | 类型     | 必须/可选 | 说明                                       |
| ------- | ------ | ----- | ---------------------------------------- |
| user    | number | 必须    | 离线消息的目标用户id,对应用户表的id                     |
| gid     | string | 必须    | 当客户端向系统提交新的消息时,会创建全局唯一的id                |
| status  | string | 必须    | 消息状态 |


### ChatsOfUser 表

存储参与会话的成员数据。

| 名称    | 类型       | 必须/可选 | 说明             |
| :---- | :------- | :---: | -------------- |
| id    | number   |  必须   | 存储在远程数据库的id    |
| cgid  | string   |  必须   | 会话的gid属性       |
| user  | number   |  必须   | 用户id,对应用户表的id  |
| order | number   |  可选   | 会话显示顺序         |
| star  | bool     |  可选   | 用户是否收藏会话       |
| hide  | bool     |  可选   | 用户是否隐藏会话       |
| mute  | bool     |  可选   | 用户是否开启免打扰      |
| quit  | datetime |  可选   | 用户退出会话时服务器的时间戳 |
| join  | datetime |  必须   | 用户加入会话时服务器的时间戳 |



## API说明

### 名词约定

client：喧喧客户端
xxd：GO 聊天服务器
xxb：后台然之服务器

### API数据格式
常见的请求对象格式
```js
{
    userID, // 用户id，xxd -> xxb 非登录时必须
    module, // 模块名称,必须
    method, // 方法名称,必须
    test,   // 可选参数，bool,默认为false。
    params, // 参数对象,可选
    data    // 请求数据,可选,与params配合使用,通常data传输是对象
}
```

常见的响应数据格式
```js
{
    module,    // 模块名称,必须
    method,    // 方法名称,必须
    users[],   // 该数据响应给哪些用户，users为空表示所有在线用户
    params,    // 参数对象,可选
    result:,   // 响应状态,可为'success'（成功）, 'fail'(失败), 'denied'(拒绝,需要登录),
    message:,  // 消息,可选,当result不为success时,使用此字段来解释原因
    data       // 数据 
}
```

### xxd启动
>xxd启动时会向xxb发送一条请求，xxb收到请求将所有用户状态重置为offline。

#### 请求
##### 方向：xxd --> xxb
```js
{
    module: 'chat',
    method: 'serverStart'
}
```

#### 响应
##### 方向：xxb ---> xxd
```js
HTTP Status Code
```

### 登录
#### 请求  
##### 方向：client --> xxd
```js
{
    module: 'chat',
    method: 'login',
    params: 
    [
        serverName, //多然之时客户端登录的服务器名称
        account,    // 用户名
        password,   // 加密后的密码
        status      // 登录后设置的状态,包括online,away,busy
    ]
 }
```
##### 方向：xxd --> xxb
xxd服务器根据module、method和serverName把请求发送给指定的xxb

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'login',
    result,
    users[]，
    data: 
    {             // 当前登录的用户数据
        id,       // ID
        account,  // 用户名
        realname, // 真实姓名
        avatar,   // 头像URL
        role,     // 角色
        dept,     // 部门ID
        status,   // 当前状态
        admin,    // 是否超级管理员，super 超级管理员 | no 普通用户
        gender,   // 性别，u 未知 | f 女 | m 男
        email,    // 邮箱
        mobile,   // 手机
        site,     // 网站
        phone,    // 电话
        ranzhiUrl // 当前用户所在的然之站点地址（可选，1.3新增）
    }
}
```
登录成功以后xxd主动从xxb服务器获取用户列表、用户所参与的会话信息和用户的离线消息发送给当前客户端。最后把xxb服务器响应给xxd服务器的登录信息去掉users字段后，发送给此会话包含的所有在线用户。

### 登出
#### 请求
##### 方向：client --> xxd
```js
{
    userID, //登出用户的id号
    module: 'chat',
    method: 'logout',
}
```

##### 方向：xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向 xxb --> xxd
```js
{
    module: 'chat',
    method: 'logout',
    result,
    users[],
    data:
    {             // 当前登录的用户数据
        id,       // ID
        account,  // 用户名
        realname, // 真实姓名
        avatar,   // 头像URL
        role,     // 角色
        dept,     // 部门ID
        status,   // 当前状态
        admin,    // 是否超级管理员，super 超级管理员 | no 普通用户
        gender,   // 性别，u 未知 | f 女 | m 男
        email,    // 邮箱
        mobile,   // 手机
        site,     // 网站
        phone     // 电话
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的登出信息去掉users字段后，发送给此会话包含的所有在线用户。

### 重复登录
>当同一用户重复登录时,系统会向前一个登录的用户推送一条特殊的消息,客户端接收到该消息后应该将用户登出，并关闭相关的网络连接。该消息不需要响应或返回结果。

##### 方向：xxd --> client
```js
{
    module:  'chat',
    method:  'kickoff',
    message: 'This account logined in another place.'
}
```

### 获取所有用户列表
#### 请求
##### 方向： client --> xxd
```js
{
    userID, //用户的id号
    module: 'chat',
    method: 'userGetlist',
    params:
    [
        idList,   // 要获取的用户信息id编号数组，可选，如果留空则获取所有用户（1.3新增）
    ]
}
```

##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'userGetlist',
    result,
    users[],
    data:
    [                 // 所有用户状态数组
        {             // 其中一个用户数据
            id,       // ID
            account,  // 用户名
            realname, // 真实姓名
            avatar,   // 头像URL
            role,     // 角色
            dept,     // 部门ID
            status,   // 当前状态
            admin,    // 是否超级管理员，super 超级管理员 | no 普通用户
            gender,   // 性别，u 未知 | f 女 | m 男
            email,    // 邮箱
            mobile,   // 手机
            site,     // 网站
            phone     // 电话
        },
        // 更多用户数据...
    ],
    roles: {
        "dev": "开发者",
        "productManager": "产品经理"   
        // 更多角色表数据，格式为键名为角色代号，键值为角色显示名称
    },
    depts: [
        {id: 2343, name: "研发部", parent: 0},
        {id: 2344, name: "项目部", parent: 2343},
        // 更多部门表数据，每个对象表示一个部门信息，parent 为上级部门id，如果没有上级部门parent值为0
    ]
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 获取当前登录用户所有会话数据
#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'getList',
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'getList',
    result,
    users[],
    data:
    [                       // 所有会话信息数组
        {                   // 其中一个会话信息
            id,             // 会话在服务器数据保存的id
            gid,            // 会话的全局id,
            name,           // 会话的名称
            type,           // 会话的类型
            admins,         // 会话允许发言的用户列表
            subject,        // 主题会话的关联主题ID
            public,         // 是否公共会话
            createdBy,      // 创建者用户名
            createdDate,    // 创建时间
            editedBy,       // 编辑者用户名
            editedDate,     // 编辑时间
            lastActiveTime, // 会话最后一次发送消息的时间
            star,           // 当前登录用户是否收藏此会话
            hide,           // 当前登录用户是否隐藏此会话
            members: 
            [               // 当前会话中包含的所有用户信息,只需要包含id即可
                {
                    id,     //用户id
                },
                // 更多用户...
            ],
        },
        // 更多会话数据...
    ]
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 获取当前登录用户所有离线消息
#### 请求
##### 方向： xxd --> xxb
```js
{
    userID,
    module: 'chat',
    method: 'getOfflineMessages',
}
```

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'message',
    result,
    users[],
    data:  // 一个包含一条或多条离线消息的数组
    [
        {                // 其中一条离线消息
            id,          // 消息在服务器保存的id
            gid,         // 此消息的gid
            cgid,        // 此消息关联的会话的gid
            user,        // 消息发送的用户名
            date,        // 消息发送的时间
            type,        // 消息的类型
            contentType, // 消息内容的类型
            content,     // 消息内容
        },
        // 更多离线消息
    ]
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给当前登录用户。

### 更改当前登录用户的信息
#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'userChange',
    params:
    [                 // 更改后的用户        
        user:         // 一个用户对象
        {
            id,       // ID
            account,  // 用户名
            realname, // 真实姓名
            avatar,   // 头像URL
            role,     // 角色
            dept,     // 部门ID
            status,   // 要设置的新状态,包括online, away, busy
            admin,    // 是否超级管理员，super 超级管理员 | no 普通用户
            gender,   // 性别，u 未知 | f 女 | m 男
            email,    // 邮箱
            mobile,   // 手机
            site,     // 网站
            phone     // 电话
        }
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'userChange',
    result,
    users[],
    data: 
    {             //当前登录用户数据     
        id,       // ID
        account,  // 用户名
        realname, // 真实姓名
        avatar,   // 头像URL
        role,     // 角色
        dept,     // 部门ID
        status,   // 状态
        admin,    // 是否超级管理员，super 超级管理员 | no 普通用户
        gender,   // 性别，u 未知 | f 女 | m 男
        email,    // 邮箱
        mobile,   // 手机
        site,     // 网站
        phone     // 电话
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 创建聊天会话
#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'create',
    params:
    [
        gid,     // 会话的全局id,
        name,    // 会话的名称
        type,    // 会话的类型
        members: [{id}, {id}...] // 会话的成员列表 
        subject, //可选,主题会话的关联主题ID,默认为0
        pulic    //可选,是否公共会话,默认为false
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
>服务器在创建会话时应该先检查gid是否已经存在，如果存在则直接为当前登录用户返回已存在的会话信息。

##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'create',
    result,
    users[],
    data:               
    {                   // 新创建的会话完整信息
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 加入或退出聊天会话
>用户可以加入类型为group并且公共的会话；用户可以退出类型为group的会话。

#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'joinchat',
    params: 
    [
        gid, // 要加入或退出的会话id
        join // 可选, true加入会话, false退出会话, 默认为true
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'joinchat',
    result,
    users[],
    data:
    {                   // 会话的完整信息
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户（包括退出会话的当前用户）。

### 更改会话名称
>用户可以更改类型为group的会话的名称。

#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'changeName',
    params:
    [
        gid, // 要更改的会话id
        name // 新的名称
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'changeName',
    result,
    users[],
    data:
    {                   // 会话的完整信息
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 收藏或取消收藏会话
>每个用户都可以单独决定收藏或取消收藏会话（加星标记）。

#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'star',
    params: 
    [
        gid, // 要收藏会话id
        star // 可选, true收藏会话, false取消收藏会话, 默认为true
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'star',
    result,
    users[],
    data:
    {        // 会话的完整信息
        gid, // 会话的全局id,   
        star // true收藏会话, false取消收藏会话, 默认为true
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给当前用户。

### 邀请新的用户到会话或者将用户踢出会话
#### 请求
>用户可以邀请一个或多个用户到类型为group的已有会话中；会话管理员可以将一个或多个用户踢出类型为group的会话。

##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'addmember',
    params: 
    [
        gid,     // 要操作的会话id
        members, // 用户id数组
        join     // 可选, true邀请用户加入会话, false将用户踢出会话, 默认为true
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
>当新用户被添加到会话之后或者用户被踢出会话后,服务器应该主动推送此会话的信息给此会话的所有在线成员；此响应与chat/create/响应的结果一致。

##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'addmember',
    result,
    users[],
    data: // 会话的完整信息
    {
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 向会话发送消息
#### 请求
>用户向一个或多个会话中发送一条或多条消息,服务器推送此消息给此会话中的所有在线成员；当前不在线的成员会在下次上线时通过离线消息送达。

##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'message',
    params: 
    [                    // 一个包含一条或多条新消息的数组
        {
            gid,         // 此消息的gid
            cgid,        // 此消息关联的会话的gid
            user,        // 如果为空,则为发送此请求的用户
            date,        // 如果为空,则已服务器处理时间为准
            type,        // 消息的类型
            contentType, // 消息内容的类型
            content      // 消息内容
        },
        // 可以在一个请求中发送多个消息
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
>当有新的消息收到时,服务器会所有消息,并发送给对应会话的所有在线成员

##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'message',
    result,
    users[],
    data:                // 一个包含一条或多条新消息的数组
    [
        {
            id,          // 消息在服务器保存的id
            gid,         // 此消息的gid
            cgid,        // 此消息关联的会话的gid
            user,        // 消息发送的用户名
            date,        // 消息发送的时间
            type,        // 消息的类型
            contentType, // 消息内容的类型
            content,     // 消息内容
        },
        // 可以有更多的消息
    ]
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 获取会话的所有消息记录
#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'history',
    params: 
    [
        gid,         // 要获取消息记录的会话gid
        recPerPage,  // 每页记录数
        pageID,      // 当前也数
        recTotal,    // 总记录数
        continued,   // 是否继续获取历史记录
        startDate,   // 历史记录最早的日期时间戳(秒)（1.3新增）
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'history',
    result,
    users[],
    data: 
    [
        {                // 一条历史消息
            gid,         // 此消息的gid
            cgid,        // 此消息关联的会话的gid
            user,        // 如果为空,则为发送此请求的用户
            date,        // 如果为空,则已服务器处理时间为准
            type,        // 消息的类型
            contentType, // 消息内容的类型
            content      // 消息内容
        },
        // 更多历史消息
    ]，
    pager: // 分页数据
    {
        recPerPage, // 每页记录数
        pageID,     // 当前页数
        recTotal,   // 总记录数
        gid,        // 当前会话id
        continued   // 是否继续获取历史记录
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 获取会话的所有成员信息
#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'members',
    params:
    [
        gid // 要获取成员列表的会话gid
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'members',
    result,
    users[],
    data: 
    [
        {
            gid, // 此消息的gid
            members: 
            [
                {
                    id,
                    // ...
                } 
            ]
        },
    ]
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 隐藏或显示会话
>每个用户都可以单独决定隐藏或显示已参与的会话。

#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'hide',
    params: 
    [
        gid, // 要收藏会话id
        hide // 可选, true隐藏会话, false显示会话, 默认为true
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'hide',
    result,
    users[],
    data:
    {
        gid, // 要隐藏或显示的会话id
        hide // true隐藏会话, false显示会话, 默认为true
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给当前用户。

### 将会话设置为公共会话或者取消设置公共会话
>用户可以将一个非主题会话设置为公共会话或者取消设置公共会话。

#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'changePublic',
    params: 
    [
        gid,
        public, // 可选,true设置公共会话,false取消设置公共会话,默认为true
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: ' chat';
    method: 'changepublic',
    result,
    users[],
    data: 
    {                   // 会话的完整信息
        id,             // 会话在服务器数据保存的id
        gid,            // 会话的全局id,
        name,           // 会话的名称
        type,           // 会话的类型
        admins,         // 会话允许发言的用户列表
        subject,        // 主题会话的关联主题ID
        public,         // 是否公共会话
        createdBy,      // 创建者用户名
        createdDate,    // 创建时间
        editedBy,       // 编辑者用户名
        editedDate,     // 编辑时间
        lastActiveTime, // 会话最后一次发送消息的时间
        members: [{id}, {id}...] // 会话的成员列表 
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 获取所有公共会话列表
#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'getPublicList'
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'getPublicList',
    result,
    users[],
    data: 
    [         // 所有公共会话信息数组
        {     // 其中一个会话信息
            id,
            gid,
            name,
            type,
            admins, 
            subject,
            public,
            createdBy,
            createdDate,
            editedBy,
            editedDate,
            lastActiveTime
        },
        // 更多会话数据...
    ]
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 设置会话管理员
#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'setAdmin',
    params: 
    [
        gid,  
        admins: [{id},{id}...], // 指定的用户列表
        isAdmin //可选, true允许指定用户发言, false禁止指定用户发言, 默认为true 
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'setAdmin',
    result,
    users[],
    data: 
    {
        id,
        gid,
        name,
        type,
        admins,
        subject,
        public,
        createdBy,
        createdDate,
        editedBy,
        editedDate
        lastActiveTime
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 设置会话允许发言的人
>通过此功能可以设置会话白名单。

#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'setCommitters',
    params: 
    [
        gid,  
        committers: [{id},{id}...] // 指定的用户列表
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'setCommitters',
    result,
    users[],
    data: 
    {
        id,
        gid,
        name,
        type,
        admins,
        subject,
        public,
        createdBy,
        createdDate,
        editedBy,
        editedDate
        lastActiveTime
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给此会话包含的所有在线用户。

### 上传下载用户在客户端的配置信息
#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'settings',
    params: 
    [
        account, //用户名
        settings //用户配置信息, 可选, 为空表示下载用户配置信息, 不为空表示上传用户配置信息, 默认为空 
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'settings',
    users[],
    result, 
    data // 用户配置信息
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给当前登录用户。

### 为会话设置分组（1.3新增）
#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'category',
    params: 
    [
        gids, // 要设置新的分组的会话 gid 数组
        category, // 新的分组名称
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'category',
    users[],
    result, 
    data: {
        gids, // 同参数
        category // 同参数
    }
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给当前登录用户。

### 管理员请求解散一个讨论组（1.3新增）
#### 请求
##### 方向：client --> xxd
```js
{
    userID,
    module: 'chat',
    method: 'dismiss',
    params: 
    [
        gid, //要解散的讨论组gid
    ]
}
```
##### 方向： xxd --> xxb
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'dismiss',
    users[],
    result, 
    data // 解散后的讨论组对象
}
```
##### 方向：xxd --> client
把xxb服务器响应给xxd服务器的信息去掉users字段后，发送给当前登录用户。

### 通知接口
#### 请求
##### 方向：xxd --> xxb
```js
{
    module: 'chat',
    method: 'notify',
    params:
    [
        offline:'', //离线用户
        sendfail:'',//失败消息
    ] 
}
```

##### 响应：xxb --> xxd
```js
{
    module: 'chat',
    method: 'notify',
    data:
    [
      {
        id:
        [
            {
                gid:                //全局唯一ID
                title:              //通知标题
                subtitle:           //通知副标题
                content:            //通知内容
                date:               //通知时间戳
                contentType:        //内容格式
                url:                //连接
                read:false          //是否已读
                actions:[
                    {
                        label:      //操作标题
                        url:        //操作指向
                        type:       //操作类型
                    }
                ]
                sender:{
                    id:             //发送方唯一标识
                    name:           //应用名称
                    avatar:         //发送方头像
                }
            }
            ...
        ]
      }
      ....
    ] 
}
```

##### 方向：xxd --> client
如果有通知从xxd返回，则xxd会将消息分发给对应的用户
```js
{
    module: 'chat',
    method: 'notify',
    data:
    [
        {
            gid:                //全局唯一ID
            title:              //通知标题
            subtitle:           //通知副标题
            content:            //通知内容
            date:               //通知时间戳
            contentType:        //内容格式
            url:                //连接
            read:false          //是否已读
            actions:[
                {
                    label:      //操作标题
                    url:        //操作指向
                    type:       //操作类型
                }
            ]
            sender:{
                id:             //发送方唯一标识
                name:           //应用名称
                avatar:         //发送方头像
            }
        }
        ...
    ] 
}
```

### 离线通知
#### 请求
##### 方向：xxd --> xxb
用户登录的时候会请求未读的离线消息
```js
{
    module: 'chat',
    method: 'getOfflineNotify',
    userID: //用户ID
}
```

##### 响应：xxb --> xxd
```js
{
    module: 'chat',
    method: 'notify',
    data:
    [
        {
            gid:                //全局唯一ID
            title:              //通知标题
            subtitle:           //通知副标题
            content:            //通知内容
            date:               //通知时间戳
            contentType:        //内容格式
            url:                //连接
            read:false          //是否已读
            actions:[
                {
                    label:      //操作标题
                    url:        //操作指向
                    type:       //操作类型
                }
            ]
            sender:{
                id:             //发送方唯一标识
                name:           //应用名称
                avatar:         //发送方头像
            }
        }
        ...
    ] 
}
```

### 检测用户变更
#### 请求
##### 方向：xxd --> xxb
用户登录的时候会请求未读的离线消息
```js
{
    module: 'chat',
    method: 'checkUserChange',
    params: ''
}
```

##### 响应：xxb --> xxd
```js
{
    module: 'chat',
    method: 'checkUserChange',
    data:   'yes' //是否有变更 yes或者no
}
```
如果返回为yes,则会请求``userGetlist``API

### 上传文件
#### 请求
##### 方向：client --> xxd

客户端通过 https 向 xxd 服务器发起 POST 请求。
请求头部需要包含如下内容：

* `ServerName`：然之服务器名称；
* `Authorization`：用户 token；

请求表单需要包含如下字段：

* `file`：文件域，包括文件名；
* `gid`：该文件所属会话的 gid；
* `userID`：当前用户 id；

以下为以 JavaScript 对象存储的请求数据示例：

```js
{
    headers: {
        ServerName: 'ranzhiServer1',
        Authorization: '12345678888888888888888888888888'
    },
    multipart: {
        {
            'Content-Disposition': 'form-data; name="file"; filename="example.txt"',
            body: e.target.result
        }, {
            'Content-Disposition': 'form-data; name="gid"',
            body: '1&2'
        }
    }
}
```

##### 方向： xxd --> xxb
```js
{
    userID,
    module: 'chat',
    method: 'uploadFile',
    params: 
    [
        fileName, // 文件名(带扩展名)
        path,     // 文件在xxd的路径
        size,     // 文件大小
        time,     // 时间戳
        gid,      // 会话ID
    ]
}
```
xxd把client发送的数据转发给xxb。

#### 响应
##### 方向：xxb --> xxd
```js
{
    module: 'chat',
    method: 'uploadFile',
    users[],
    result, 
    data: fileID  // 文件在然之服务器数据库存储的id
}
```
##### 方向：xxd --> client

xxd 服务器在客户端发起的 POST 请求中以 JSON 文本格式返回文件基本信息。

```js
{
    result: 'success',
    data: 
    {
        url,      // 文件在xxd服务器上的下载地址（可选，无此属性会按照规则生成 URL 地址）
        time,     // 时间戳
        id,       // 文件 ID 
        name,     // 文件标题
    }
}
```

### 扩展列表
xxc登录成功后会向xxb发送一个请求，返回客户端的应用列表。

#### 请求
##### 方向：xxd --> xxb
    ```js
    {
        module: 'chat',
        method: 'serverStart'
        userID: 
    }
    ```

#### 响应
##### 方向：xxb --> xxd
    ```js
    {
        "result": "success",
        "data": [
            {
                "entryID": //应用ID,
                "name": //应用识别代码,
                "displayName": //显示名称,
                "abbrName": //名称简写,
                "webViewUrl": //应用http访问地址,
                "download": //扩展配置文件下载地址,
                "md5": //扩展附件md5,
                "logo": //应用LOGO
            },
            ...
        ],
        "users":
    }
    ```
    
    
### 应用免登录入口
#### 请求
##### 方向：client --> xxb
```js
{
    module: 'entry',
    method: 'visit'
    params:{
        entryID://应用ID
        referer://目标地址(可选) 设置此向登录成功后将跳转到此地址，否则跳转到应用的http访问地址
    }
    userID: //用户ID
}
```

#### 返回
##### 方向：xxb --> client
```js
{
    "result": "success",
    "data": "url..." //免登录地址
}
```

