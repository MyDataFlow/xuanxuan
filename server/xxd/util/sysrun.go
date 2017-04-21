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
	"flag"
	"os"
	"runtime"
)

const Version = "V0.1"

var Run bool = true
var IsTest bool = false
var Token []byte

func init() {

	isTest := flag.Bool("test", false, "server test model")
	flag.Parse()
	IsTest = *isTest

	timeStr := Int642String(GetUnixTime())
	Token = []byte(GetMD5(timeStr))
	Token = []byte("12345678888888888888888888888888")

	LogInfo().Println()
	LogInfo().Printf("sys start,version:%s, server test model is %v\n", Version, IsTest)
	LogInfo().Printf("ProgramName:%s,System:%s-%s", GetProgramName(), runtime.GOOS, runtime.GOARCH)

	runtime.GOMAXPROCS(runtime.NumCPU())
}

func GetNumGoroutine() int {
	return runtime.NumGoroutine()
}

func Exit(extStr string) {
	Println(extStr)
	os.Exit(1)
}
