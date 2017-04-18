/**
 * The crontask file of crontask current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     util
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

	// check user change 10 second
	userChange = 10 * time.Second
)

func CronTask() {
	go func() {
		logTicker := time.NewTicker(checkLog)
		userChangeTicker := time.NewTicker(userChange)

		defer func() {
			logTicker.Stop()
			userChangeTicker.Stop()
		}()

		for util.Run {
			select {
			case <-logTicker.C:
				util.CheckLog()

			case <-userChangeTicker.C:

			}
		}
	}()
}

//信号处理

//系统监控
