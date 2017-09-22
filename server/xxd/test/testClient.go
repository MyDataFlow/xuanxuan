/**
 * The test file of test current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     main
 * @link        http://www.zentao.net
 */

package main

import (
    "flag"
    "log"
    "net/url"
    "runtime"
    "time"

    "github.com/gorilla/websocket"
)

var addr = flag.String("addr", "192.168.1.99:11444", "http service address")
var token = flag.String("token", "", "copy server token")
var clientNum = flag.Int("clientNum", 1, "client number")

func main() {
    runtime.GOMAXPROCS(runtime.NumCPU())

    flag.Parse()
    log.SetFlags(0)

    for i := 0; i < *clientNum; i++ {
        //每秒10次
        time.Sleep(100 * time.Millisecond)
        go testClient()
    }

    for runtime.NumGoroutine() > 2 {
        time.Sleep(2 * time.Second)
    }
}

func testClient() {

    u := url.URL{Scheme: "ws", Host: *addr, Path: "/ws"}
    log.Printf("connecting to %s", u.String())

    c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
    if err != nil {
        log.Fatal("dial:", err)
    }
    defer c.Close()

    /*                            此处默认不需要修改                    */
    logIn := `{"module":"chat","method":"login","test":true,"params":[""]}`

    data, err := aesEncrypt([]byte(logIn), []byte(*token))
    if err != nil {
        log.Println("aes encrypt error:", err)
        return
    }

    err = c.WriteMessage(websocket.BinaryMessage, data)
    if err != nil {
        log.Println("write:", err)
        return
    }

    for {
        _, message, err := c.ReadMessage()
        if err != nil {
            log.Println("read:", err)
            return
        }

        message, err = aesDecrypt(message, []byte(*token))
        //log.Printf("recv: %v", string(message))
    }

    return
}
