/**
 * The aes file of websocket current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     util
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
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	// User server
	serverName string

	// Send to user id
	userID string
}

type SendMsg struct {
	serverName string
	usersID    []string
	message    []byte
}

func switchMethod(message []byte, client *Client) error {
	parseData := api.ApiParse(message, util.Token)
	if parseData == nil {
		util.LogError().Println("recve client message error")
		return util.Errorf("recve client message error")
	}

	switch parseData.Module() + "." + parseData.Method() {
	case "chat.login":
		loginData, userID, ok := api.ChatLogin(parseData)
		if userID == "" {
			util.LogError().Println("chat login error")
			return util.Errorf("%s\n", "chat login error")
		}

		if !ok {
			//登录失败返回错误信息
			client.send <- loginData

			util.LogError().Println("chat login error")
			return util.Errorf("%s\n", "chat login error")
		}
		// 成功后返回login数据给客户端
		client.send <- loginData

		client.serverName = parseData.ServerName()
		client.userID = userID

		// 获取所有用户列表
		usergl, err := api.UserGetlist(client.serverName, client.userID)
		if err != nil {
			util.LogError().Println("chat user get list error")
			//返回给客户端登录失败的错误信息
			return err
		}
		// 成功后返回usergl数据给客户端
		client.send <- usergl

		//获取当前登录用户所有会话数据,组合好的数据放入send发送队列
		getlist, err := api.Getlist(client.serverName, client.userID)
		if err != nil {
			util.LogError().Println("chat get list error")
			// 返回给客户端登录失败的错误信息
			return err
		}
		// 成功后返回gl数据给客户端
		client.send <- getlist

		// 推送当前登录用户信息给其他在线用户
		//因为是broadcast类型，所以不需要初始化userID
		client.hub.broadcast <- SendMsg{serverName: client.serverName, message: loginData}

		// 以上成功后把socket加入到管理队列
		client.hub.register <- client
		break

	case "chat.logout":
		api.ChatLogout()
		break

	}

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
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for util.Run {
		msgType, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				util.LogError().Printf("error: %v", err)
			}
			break
		}

		if msgType != websocket.TextMessage {
			continue
		}

		//返回user id 、登录响应的数据、ok
		if switchMethod(message, c) != nil {
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
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

// serveWs handles websocket requests from the peer.
func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		util.LogError().Println("serve ws upgrader error:", err)
		return
	}

	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}

	util.LogInfo().Println("client ip:", conn.RemoteAddr())
	go client.writePump()
	client.readPump()
}
