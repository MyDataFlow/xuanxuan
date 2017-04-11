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

import "xxd/util"

// hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients. map[ranzhiName][clientID]*Client
	clients map[string]map[string]*Client

	// Inbound messages from the clients.
	multicast chan SendMsg
	broadcast chan SendMsg

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func newHub() *Hub {
	hub := &Hub{
		multicast:  make(chan SendMsg),
		broadcast:  make(chan SendMsg),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[string]map[string]*Client),
	}

	for ranzhiName := range util.Config.RanzhiServer {
		hub.clients[ranzhiName] = map[string]*Client{}
	}

	return hub
}

func (h *Hub) run() {
	for util.Run {
		select {
		case client := <-h.register:
			// 根据传入的client对指定服务器的userid进行socket注册
			h.clients[client.serverName][client.userID] = client

		case client := <-h.unregister:
			// 收到失败的socket就进行注销
			if _, ok := h.clients[client.serverName][client.userID]; ok {
				close(client.send)
				delete(h.clients[client.serverName], client.userID)
			}

		case sendMsg := <-h.multicast:
			// 对指定的用户群发送消息
			for _, userID := range sendMsg.usersID {
				client := h.clients[sendMsg.serverName][userID]
				select {
				case client.send <- sendMsg.message:
				default:
					close(client.send)
					delete(h.clients[client.serverName], client.userID)
				}
			}

		case sendMsg := <-h.broadcast:
			// 对所有的在线用户发送消息
			for userID := range h.clients[sendMsg.serverName] {
				client := h.clients[sendMsg.serverName][userID]
				select {
				case client.send <- sendMsg.message:
				default:
					close(client.send)
					delete(h.clients[client.serverName], client.userID)
				}
			}
		} // run select
	} // run for
}
