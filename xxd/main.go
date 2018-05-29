/**
 * The main file of main current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     main
 * @link        http://www.zentao.net
 */
package main

import (
    "xxd/crontask"
    "xxd/hyperttp/server"
    "xxd/util"
    "xxd/wsocket"
)

func main() {
    crontask.CronTask()

    go server.InitHttp()
    go wsocket.InitWs()

    exitServer()
}

func exitServer() {
    for util.Run && util.GetNumGoroutine() > 2 {
        //util.Println("sleep ...")
        util.Sleep(3)
    }
}
