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
    "xxd/hyperttp/server"
)

const (
    webSocket = "/ws"
    ownSocket = "/ownData"
)

func InitWs() {
    hub := newHub()
    go hub.run()

    // 初始化路由
    http.HandleFunc(webSocket, func(w http.ResponseWriter, r *http.Request) {
        serveWs(hub, w, r)
    })

    http.HandleFunc(ownSocket, func(w http.ResponseWriter, r *http.Request) {
        ownWs(hub, w, r)
    })

    addr := util.Config.Ip + ":" + util.Config.ChatPort
    util.LogInfo().Println("websocket start,listen addr:", addr, webSocket)

    // 创建服务器
    if util.Config.IsHttps != "1" {
        err := http.ListenAndServe(addr, nil)
        if err != nil {
            util.LogError().Println("websocket server listen err:", err)
            util.Exit("websocket server listen err")
        }
    }else{
        crt, key, error := server.CreateSignedCertKey()
        if error != nil {
            util.LogError().Println("ssl config err:", error)
            util.Exit("wss ssl create file err")
        }

        err := http.ListenAndServeTLS(addr, crt, key, nil)
        if err != nil {
            util.LogError().Println("wss websocket server listen err:", err)
            util.Exit("wss websocket server listen err")
        }
    }
}
