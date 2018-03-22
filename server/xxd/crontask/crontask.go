/**
 * The crontask file of crontask current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     crontask
 * @link        http://www.zentao.net
 */
package crontask

import (
    "time"
    "xxd/util"
)

const (
    // check and create log 30 second
    checkLog = 30 * time.Second
)

//定时任务
func CronTask() {
    go func() {
        logTicker := time.NewTicker(checkLog)

        defer func() {
            logTicker.Stop()
        }()

        for util.Run {
            select {
            case <-logTicker.C:
                // 定时处理log日志
                util.CheckLog()
            }
        }
    }()
}
