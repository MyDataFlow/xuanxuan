/**
 * The sysrun file of util current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     util
 * @link        http://www.zentao.net
 */
package util

import (
	"runtime"
)

const Version = "V0.1"

var Run bool = true
var IsTest bool = true
var Token []byte

func init() {
	timeStr := Int642String(GetUnixTime())
	Token = []byte(GetMD5(timeStr))
	Token = []byte("12345678888888888888888888888888")

	LogInfo().Println()
	LogInfo().Println("sys start!")
	LogInfo().Printf("ProgramName:%s,System:%s-%s", GetProgramName(), runtime.GOOS, runtime.GOARCH)

	runtime.GOMAXPROCS(runtime.NumCPU())
}

func GetNumGoroutine() int {
	return runtime.NumGoroutine()
}
