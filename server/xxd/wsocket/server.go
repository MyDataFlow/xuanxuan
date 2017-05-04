/**
 * The server file of wsocket current module of xxd.
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
	"xxd/util"
)

const (
	webSocket = "/ws"
	ownSocket = "/ownData"
)

func InitWs() {
	hub := newHub()
	go hub.run()

	http.HandleFunc(webSocket, func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	http.HandleFunc(ownSocket, func(w http.ResponseWriter, r *http.Request) {
		ownWs(hub, w, r)
	})

	addr := util.Config.Ip + ":" + util.Config.ChatPort
	util.LogInfo().Println("websocket start,listen addr:", addr, webSocket)

	err := http.ListenAndServe(addr, nil)
	if err != nil {
		util.LogError().Println("websocket server listen err:", err)
		util.Exit("websocket server listen err")
	}
}
