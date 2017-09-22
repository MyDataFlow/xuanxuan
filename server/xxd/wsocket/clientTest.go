/**
 * The clientTest file of wsocket current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     wsocket
 * @link        http://www.zentao.net
 */
package wsocket

import (
    "sync"
    "xxd/api"
    "xxd/util"
)

var mu sync.RWMutex
var clientTestCount int64 = 0

func testSwitchMethod(message []byte, parseData api.ParseData, client *Client) error {
    switch parseData.Module() + "." + parseData.Method() {
    case "chat.login":
        if err := chatTestLogin(parseData, client); err != nil {
            return err
        }
        break

    case "chat.logout":
        break

    default:
        chatTestMessage(parseData, client)
        break
    }

    return nil
}

func chatTestLogin(parseData api.ParseData, client *Client) error {
    client.userID = autoNumber()
    client.serverName = parseData.ServerName()
    if client.serverName == "" {
        client.serverName = util.Config.DefaultServer
    }

    cRegister := &ClientRegister{client: client, retClient: make(chan *Client)}
    defer close(cRegister.retClient)

    client.hub.register <- cRegister
    if retClient := <-cRegister.retClient; retClient.repeatLogin {
        retClient.send <- api.RepeatLogin()

        util.Println("chat test login error")
        return util.Errorf("%s\n", "chat test login error")
    }

    //client.hub.broadcast <- SendMsg{serverName: client.serverName, message: api.TestLogin()}

    return nil
}

func chatTestMessage(parseData api.ParseData, client *Client) error {
    message := api.ApiUnparse(parseData, util.Token)
    client.hub.broadcast <- SendMsg{serverName: client.serverName, message: message}

    return nil
}

func autoNumber() int64 {
    mu.RLock()
    defer mu.RUnlock()

    clientTestCount++
    return clientTestCount
}

func decrementing() int64 {
    return 0
}

func retClientTestCount() int64 {
    return 0
}
