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
	"xxd/util"
)

/*
func init() {
	go cronTask()
}
*/

func CronTask() {
	go func() {
		for util.Run {
			util.Sleep(30)

			util.CheckLog()
		}
	}()
}

//信号处理

//系统监控
