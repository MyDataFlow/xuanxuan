/**
 * The client file of wsocket current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     wsocket
 * @link        http://www.zentao.net
 */
package wsocket

import (
    "net/http"
    "time"

    "github.com/gorilla/websocket"
    "xxd/api"
    "xxd/util"
)

const (
    // Time allowed to write a message to the peer.
    writeWait = 10 * time.Second

    // Time allowed to read the next pong message from the peer.
    pongWait = 20 * time.Second

    // Send pings to peer with this period. Must be less than pongWait.
    pingPeriod = (pongWait * 9) / 10

    // Maximum message size allowed from peer.
    maxMessageSize = 20480
)

var (
    newline = []byte{'\n'}
    space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  20480,
    WriteBufferSize: 20480,
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
    hub         *Hub
    conn        *websocket.Conn // The websocket connection.
    send        chan []byte     // Buffered channel of outbound messages.
    serverName  string          // User server
    userID      int64           // Send to user id
    repeatLogin bool
    cVer        string //client version
}

type ClientRegister struct {
    client    *Client
    retClient chan *Client
}

// send message struct
type SendMsg struct {
    serverName string // send ranzhi server name
    usersID    []int64
    message    []byte
}

//解析数据.
func dataProcessing(message []byte, client *Client) error {
    parseData, err := api.ApiParse(message, util.Token)
	parseData["client"] = client.conn.RemoteAddr()
    if err != nil {
        util.LogError().Println("receive client message error")
        return err
    }

    if util.IsTest && parseData.Test() {
        return testSwitchMethod(message, parseData, client)
    }

    return switchMethod(api.ApiUnparse(parseData, util.Token), parseData, client)
}

//根据不同的消息体选择对应的处理方法
func switchMethod(message []byte, parseData api.ParseData, client *Client) error {

    switch parseData.Module() + "." + parseData.Method() {
    case "chat.login":

        if err := chatLogin(parseData, client); err != nil {
            return err
        }

        break

    case "chat.logout":
        client.conn.Close()
        /*
           if err := chatLogout(parseData.UserID(), client); err != nil {
               return err
           }
        */
        break

    default:
        err := transitData(message, parseData.UserID(), client)
        if err != nil {
            util.LogError().Println(err)
        }
        break
    }

    return nil
}

//用户登录
func chatLogin(parseData api.ParseData, client *Client) error {
    client.serverName = parseData.ServerName()
    if client.serverName == "" {
        client.serverName = util.Config.DefaultServer
    }

    if(util.Config.MaxOnlineUser > 0) {
        onlineUser := len(client.hub.clients[client.serverName])
        if(int64(onlineUser) >= util.Config.MaxOnlineUser) {
            client.send <- api.BlockLogin()
            return util.Errorf("Exceeded the maximum limit.")
        }
    }

    loginData, userID, ok := api.ChatLogin(parseData)
    if userID == -1 {
        util.LogError().Println("chat login error")
        return util.Errorf("%s", "chat login error")
    }

    if !ok {
        // 登录失败返回错误信息
        client.send <- loginData
        return util.Errorf("%s", "chat login error")
    }
    // 成功后返回login数据给客户端
    client.send <- loginData

    client.userID = userID

    // 生成并存储文件会员
    userFileSessionID, err := api.UserFileSessionID(client.serverName, client.userID)
    if err != nil {
        util.LogError().Println("chat user create file session error:", err)
        //返回给客户端登录失败的错误信息
        return err
    }
    // 成功后返回userFileSessionID数据给客户端
    client.send <- userFileSessionID

    // 获取所有用户列表
    getList, err := api.UserGetlist(client.serverName, client.userID)
    if err != nil {
        util.LogError().Println("chat user get user list error:", err)
        //返回给客户端登录失败的错误信息
        return err
    }
    // 成功后返回usergl数据给客户端
    client.send <- getList

    // 获取当前登录用户所有会话数据,组合好的数据放入send发送队列
    chatList, err := api.Getlist(client.serverName, client.userID)
    if err != nil {
        util.LogError().Println("chat get list error:", err)
        // 返回给客户端登录失败的错误信息
        return err
    }
    // 成功后返回gl数据给客户端
    client.send <- chatList

    //获取离线消息
    offlineMessages, err := api.GetofflineMessages(client.serverName, client.userID)
    if err != nil {
        util.LogError().Println("chat get offline messages error")
        // 返回给客户端登录失败的错误信息
        return err
    }
    client.send <- offlineMessages

    offlineNotify, err := api.GetOfflineNotify(client.serverName, client.userID)
    if err != nil {
        util.LogError().Println("chat get offline notify error")
        return err
    }
    client.send <- offlineNotify

    // 推送当前登录用户信息给其他在线用户
    // 因为是broadcast类型，所以不需要初始化userID
    client.hub.broadcast <- SendMsg{serverName: client.serverName, message: loginData}

    cRegister := &ClientRegister{client: client, retClient: make(chan *Client)}
    defer close(cRegister.retClient)

    // 以上成功后把socket加入到管理
    client.hub.register <- cRegister
    if retClient := <-cRegister.retClient; retClient.repeatLogin {
        //客户端收到信息后需要关闭socket连接，否则连接不会断开
        retClient.send <- api.RepeatLogin()
        return nil
    }

    return nil
}

//会话退出
func chatLogout(userID int64, client *Client) error {
    if client.userID != userID {
        return util.Errorf("%s", "user id error.")
    }
    if client.repeatLogin {
        return nil
    }
    x2cMessage, sendUsers, err := api.ChatLogout(client.serverName, client.userID)
    if err != nil {
        return err
    }
    util.DelUid(client.serverName, util.Int642String(client.userID))
    return X2cSend(client.serverName, sendUsers, x2cMessage, client)
}

//交换数据
func transitData(message []byte, userID int64, client *Client) error {
    if client.userID != userID {
        return util.Errorf("%s", "user id err")
    }

    x2cMessage, sendUsers, err := api.TransitData(message, client.serverName)
    if err != nil {
        // 与然之服务器交互失败后，生成error并返回到客户端
        errMsg, retErr := api.RetErrorMsg("0", "time out")
        if retErr != nil {
            return retErr
        }

        client.send <- errMsg
        return err
    }

    return X2cSend(client.serverName, sendUsers, x2cMessage, client)
}

//Send the message from XXD to XXC.
//If the user is empty, broadcast messages.
func X2cSend(serverName string, sendUsers []int64, message []byte, client *Client) error {
    if len(sendUsers) == 0 {
        client.hub.broadcast <- SendMsg{serverName: serverName, message: message}
        return nil
    }

    client.hub.multicast <- SendMsg{serverName: serverName, usersID: sendUsers, message: message}
    return nil
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
    defer func() {
        c.hub.unregister <- c
        c.conn.Close()
        chatLogout(c.userID, c) // user logout
    }()

    c.conn.SetReadLimit(maxMessageSize)
    c.conn.SetReadDeadline(time.Now().Add(pongWait))
    c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

    for util.Run {
        _, message, err := c.conn.ReadMessage()
        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
                util.LogError().Printf("error: %v", err)
            }

            util.LogError().Printf("error: %v", err)
            break
        }

        //返回user id 、登录响应的数据、ok
        if dataProcessing(message, c) != nil {
            util.LogInfo().Println("client exit ip:", c.conn.RemoteAddr())
            break
        }
    }
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
    ticker := time.NewTicker(pingPeriod)
    defer func() {
        ticker.Stop()
        c.conn.Close()
    }()

    for util.Run {
        select {
        case message, ok := <-c.send:
            c.conn.SetWriteDeadline(time.Now().Add(writeWait))
            if !ok {
                // The hub closed the channel.
                c.conn.WriteMessage(websocket.CloseMessage, []byte{})
                util.LogError().Println("The hub closed the channel")
                return
            }
            if err := c.conn.WriteMessage(websocket.BinaryMessage, message); err != nil {
                go sendFail(message, c)
                util.LogError().Println("write message error", err)
                return
            }

            n := len(c.send)
            for i := 0; i < n; i++ {
                if err := c.conn.WriteMessage(websocket.BinaryMessage, <-c.send); err != nil {
                    util.LogError().Println("write message error", err)
                    return
                }
            }
        case <-ticker.C:
            c.conn.SetWriteDeadline(time.Now().Add(writeWait))
            if err := c.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
                util.LogError().Println("write ping message error:", err)
                return
            }
        }
    }
}

func sendFail(message []byte, c *Client) {
    parseData, err := api.ApiParse(message, util.Token)
    if err != nil {
        util.LogError().Println("receive client message error")
        return
    }

    if parseData.Module()+"."+parseData.Method() == "chat.message" {
        if data, ok := parseData["data"].([]interface{}); ok {
            for _, item := range data {
                dataMap := item.(map[string]interface{})
                if gid, ok := dataMap["gid"].(string); ok {
                    util.DBInsertSendfail(c.serverName, c.userID, gid)
                }
            }
        }
    }
}

// serveWs handles websocket requests from the peer.
func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
    // Delete origin header @see https://www.iphpt.com/detail/86/
    r.Header.Del("Origin")

    //将xxd版本信息通过header返回给客户端
    header := http.Header{"User-Agent": {"easysoft/xuan.im"}, "xxd-version": {util.Version}}

    conn, err := upgrader.Upgrade(w, r, header)
    if err != nil {
        util.LogError().Println("serve ws upgrader error:", err)
        return
    }

    client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), repeatLogin: false, cVer: r.Header.Get("version")}

    util.LogInfo().Println("client ip:", conn.RemoteAddr())
    go client.writePump()
    client.readPump()
}
