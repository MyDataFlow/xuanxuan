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
    "os"
)

type RanzhiServer struct {
    RanzhiAddr  string
    RanzhiToken []byte
    //RanzhiEncrypt bool
}

type ConfigIni struct {
    Ip         string
    ChatPort   string
    CommonPort string
    IsHttps    string

    UploadPath     string
    UploadFileSize int64

    MaxOnlineUser int64

    // multiSite or singleSite
    SiteType      string
    DefaultServer string
    RanzhiServer  map[string]RanzhiServer

    LogPath string
    CrtPath string
}

const configPath = "config/xxd.conf"

var Config = ConfigIni{SiteType: "singleSite", RanzhiServer: make(map[string]RanzhiServer)}

func init() {
    dir, _ := os.Getwd()
    data, err := goconfig.LoadConfigFile(dir + "/" + configPath)
    if err != nil {

        Config.Ip = "127.0.0.1"
        Config.ChatPort = "11444"
        Config.CommonPort = "11443"
        Config.IsHttps = "1"

        Config.UploadPath = "tmpfile"
        Config.UploadFileSize = 32 * MB

        Config.SiteType = "singleSite"
        Config.DefaultServer = "xuanxuan"
        Config.RanzhiServer["xuanxuan"] = RanzhiServer{"serverInfo", []byte("serverInfo")}

        Config.LogPath = dir + "/log/"
        Config.CrtPath = dir + "/certificate/"
        Config.MaxOnlineUser = 0

        log.Println("config init error，use default conf!")
        log.Println(Config)
        return
    }

    getIP(data)
    getChatPort(data)
    getCommonPort(data)
    getIsHttps(data)
    getUploadPath(data)
    getRanzhi(data)
    getLogPath(data)
    getCrtPath(data)
    getUploadFileSize(data)
    getMaxOnlineUser(data)
}

//获取配置文件IP
func getIP(config *goconfig.ConfigFile) (err error) {
    Config.Ip, err = config.GetValue("server", "ip")
    if err != nil {
        log.Fatal("config: get server ip error,", err)
    }

    return
}

//会话端口
func getChatPort(config *goconfig.ConfigFile) (err error) {
    Config.ChatPort, err = config.GetValue("server", "chatPort")
    if err != nil {
        log.Fatal("config: get server chart port error,", err)
    }

    return
}

//服务端口
func getCommonPort(config *goconfig.ConfigFile) (err error) {
    Config.CommonPort, err = config.GetValue("server", "commonPort")
    if err != nil {
        log.Fatal("config: get server upload port error,", err)
    }

    return
}

//判断是否启用https
func getIsHttps(config *goconfig.ConfigFile) (err error) {
    Config.IsHttps, err = config.GetValue("server", "isHttps")
    if err != nil {
        log.Fatal("config: get server upload port error,", err)
    }
    return
}

//获取上传目录
func getUploadPath(config *goconfig.ConfigFile) (err error) {
    Config.UploadPath, err = config.GetValue("server", "uploadPath")
    if err != nil {
        log.Fatal("config: get server upload path error,", err)
    }

    return
}

//获取上传大小
func getUploadFileSize(config *goconfig.ConfigFile) error {

    Config.UploadFileSize = 32 * MB
    var fileSize int64 = 0

    uploadFileSize, err := config.GetValue("server", "uploadFileSize")
    if err != nil {
        log.Printf("config: get server upload file size error:%v, default size 32MB.", err)
        return err
    }

    switch size, suffix := sizeSuffix(uploadFileSize); suffix {
    case "K":
        if fileSize, err = String2Int64(size); err == nil {
            Config.UploadFileSize = fileSize * KB
        }

    case "M":
        if fileSize, err = String2Int64(size); err == nil {
            Config.UploadFileSize = fileSize * MB
        }

    case "G":
        if fileSize, err = String2Int64(size); err == nil {
            Config.UploadFileSize = fileSize * GB
        }

    default:
        if fileSize, err = String2Int64(size); err == nil {
            Config.UploadFileSize = fileSize
        } else {
            log.Println("config: get server upload file size error, default size 32MB.")
        }
    }

    if err != nil {
        log.Println("upload file size parse error:", err)
    }

    return err
}

func getMaxOnlineUser(config *goconfig.ConfigFile) error {

    Config.MaxOnlineUser = 0
    var maxOnlineUser int64 = 0

    onlineUser, err := config.GetValue("server", "maxOnlineUser")
    if err != nil {
        log.Printf("config: get server maxUser error:%v, default size 0.", err)
        return err
    }

    if maxOnlineUser, err = String2Int64(onlineUser); err == nil {
        Config.MaxOnlineUser = maxOnlineUser
    }

    if err != nil {
        log.Println("upload file size parse error:", err)
    }

    return err
}

//获取服务器列表,conf中[ranzhi]段不能改名.
func getRanzhi(config *goconfig.ConfigFile) {
    keyList := config.GetKeyList("ranzhi")

    Config.DefaultServer = ""
    if len(keyList) > 1 {
        Config.SiteType = "multiSite"
    }

    for _, ranzhiName := range keyList {
        ranzhiServer, err := config.GetValue("ranzhi", ranzhiName)
        if err != nil {
            log.Fatal("config: get ranzhi server error,", err)
        }

        serverInfo := strings.Split(ranzhiServer, ",")
        //逗号前面是地址，后面是token，token长度固定为32
        if len(serverInfo) < 2 || len(serverInfo[1]) != 32 {
            log.Fatal("config: ranzhi server config error")
        }

        if len(serverInfo) >= 3 && serverInfo[2] == "default" {
            Config.DefaultServer = ranzhiName
        }

        Config.RanzhiServer[ranzhiName] = RanzhiServer{serverInfo[0], []byte(serverInfo[1])}
    }
}

//获取日志路径
func getLogPath(config *goconfig.ConfigFile) (err error) {
    dir, _ := os.Getwd()
    logPath, err := config.GetValue("log", "logPath")
    if err != nil {
        log.Fatal("config: get server log path error,", err)
    }
    Config.LogPath = dir + "/" + logPath
    return
}

//获取证书路径
func getCrtPath(config *goconfig.ConfigFile) (err error) {
    dir, _ := os.Getwd()
    crtPath, err := config.GetValue("certificate", "crtPath")
    if err != nil {
        log.Fatal("config: get certificate crt path error,", err)
    }
    Config.CrtPath = dir + "/" + crtPath
    return
}

func sizeSuffix(uploadFileSize string) (string, string) {
    if strings.HasSuffix(uploadFileSize, "K") {
        return strings.TrimSuffix(uploadFileSize, "K"), "K"
    }

    if strings.HasSuffix(uploadFileSize, "M") {
        return strings.TrimSuffix(uploadFileSize, "M"), "M"
    }

    if strings.HasSuffix(uploadFileSize, "G") {
        return strings.TrimSuffix(uploadFileSize, "G"), "G"
    }

    return uploadFileSize, ""
}
