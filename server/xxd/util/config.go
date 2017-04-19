/**
 * The config file of util current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     util
 * @link        http://www.zentao.net
 */
package util

import (
	"github.com/Unknwon/goconfig"
	"log"
	"strings"
)

type RanzhiServer struct {
	RanzhiAddr  string
	RanzhiToken []byte
}

type ConfigIni struct {
	Ip         string
	ChatPort   string
	CommonPort string
	UploadPath string

	// multiSite or singleSite
	SiteType     string
	RanzhiServer map[string]RanzhiServer

	LogPath string
	CrtPath string
}

const configPath = "config/xxd.conf"

var Config = ConfigIni{SiteType: "singleSite", RanzhiServer: make(map[string]RanzhiServer)}

func init() {
	data, err := goconfig.LoadConfigFile(configPath)
	if err != nil {

		Config.Ip = "127.0.0.1"
		Config.ChatPort = "1129"
		Config.CommonPort = "11443"
		Config.UploadPath = "tmpfile"
		Config.RanzhiServer["ranzhiName"] = RanzhiServer{"serverInfo", []byte("serverInfo")}

		Config.LogPath = "log/"
		Config.CrtPath = "certificate/"

		log.Println("config init error，use default conf!")
		return
	}

	getIP(data)
	getChatPort(data)
	getCommonPort(data)
	getUploadPath(data)
	getRanzhi(data)
	getLogPath(data)
	getCrtPath(data)
}

func getIP(config *goconfig.ConfigFile) (err error) {
	Config.Ip, err = config.GetValue("server", "ip")
	if err != nil {
		log.Fatal("config: get server ip error,", err)
	}

	return
}

func getChatPort(config *goconfig.ConfigFile) (err error) {
	Config.ChatPort, err = config.GetValue("server", "chatPort")
	if err != nil {
		log.Fatal("config: get server chart port error,", err)
	}

	return
}

func getCommonPort(config *goconfig.ConfigFile) (err error) {
	Config.CommonPort, err = config.GetValue("server", "commonPort")
	if err != nil {
		log.Fatal("config: get server upload port error,", err)
	}

	return
}

func getUploadPath(config *goconfig.ConfigFile) (err error) {
	Config.UploadPath, err = config.GetValue("server", "uploadPath")
	if err != nil {
		log.Fatal("config: get server upload path error,", err)
	}

	return
}

func getRanzhi(config *goconfig.ConfigFile) {
	keyList := config.GetKeyList("ranzhi")

	if len(keyList) > 1 {
		Config.SiteType = "multiSite"
	}

	for _, ranzhiName := range keyList {
		ranzhiServer, err := config.GetValue("ranzhi", ranzhiName)
		if err != nil {
			log.Fatal("config: get ranzhi server error,", err)
		}

		serverInfo := strings.Split(ranzhiServer, ",")
		if len(serverInfo) != 2 {
			log.Fatal("config: ranzhi server config error,", err)
		}

		Config.RanzhiServer[ranzhiName] = RanzhiServer{serverInfo[0], []byte(serverInfo[1])}
	}
}

func getLogPath(config *goconfig.ConfigFile) (err error) {
	Config.LogPath, err = config.GetValue("log", "logPath")
	if err != nil {
		log.Fatal("config: get server log path error,", err)
	}

	return
}

func getCrtPath(config *goconfig.ConfigFile) (err error) {
	Config.CrtPath, err = config.GetValue("certificate", "crtPath")
	if err != nil {
		log.Fatal("config: get certificate crt path error,", err)
	}

	return
}
