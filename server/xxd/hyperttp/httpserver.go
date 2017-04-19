/**
 * The httpserver file of hyperttp current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     util
 * @link        http://www.zentao.net
 */
package hyperttp

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"xxd/util"
)

type vtscInfo struct {
	// server version
	Version string `json:"version"`

	// encrypt key
	Token string `json:"token"`

	// multiSite or singleSite
	SiteType string `json:"siteType"`

	ChatPort  int  `json:"chatPort"`
	TestModel bool `json:"testModel"`
}

// route
const (
	download = "/download"
	upload   = "/upload"
	sInfo    = "/serverInfo"
)

func InitHttp() {
	crt, key, err := CreateSignedCertKey()
	if err != nil {
		util.LogError().Println("https server start error!")
		return
	}

	http.HandleFunc(download, fileDownload)
	http.HandleFunc(upload, fileUpload)
	http.HandleFunc(sInfo, serverInfo)

	addr := util.Config.Ip + ":" + util.Config.CommonPort
	util.LogInfo().Println("http server start,listen addr:", addr, download)
	util.LogInfo().Println("http server start,listen addr:", addr, upload)
	util.LogInfo().Println("http server start,listen addr:", addr, sInfo)

	if err := http.ListenAndServeTLS(addr, crt, key, nil); err != nil {
		util.LogError().Println("ListenAndServe:", err)
	}

}

func fileDownload(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		fmt.Fprintln(w, "not supported request")
		return
	}

	// fromat "username,token"
	auth := r.Header.Get("Authorization")
	authInfo := strings.Split(auth, ",")
	if len(authInfo) != 2 {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if authInfo[1] != string(util.Token) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	r.ParseForm()
	reqFileName := r.Form["fileName"][0]
	reqFileTime := r.Form["time"][0]

	// new file name = md5(old filename + nowTime + username)
	fileTime, err := util.String2Int64(reqFileTime)
	if err != nil {
		util.LogError().Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	fileName := util.Config.UploadPath + util.GetYmdPath(fileTime) + util.GetMD5(reqFileName+reqFileTime+authInfo[0])
	if util.IsNotExist(fileName) || util.IsDir(fileName) {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, fileName)
}

func fileUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		fmt.Fprintln(w, "not supported request")
		return
	}

	// fromat "username,token"
	auth := r.Header.Get("Authorization")
	authInfo := strings.Split(auth, ",")
	if len(authInfo) != 2 {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if authInfo[1] != string(util.Token) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	r.ParseMultipartForm(32 << 20)
	file, handler, err := r.FormFile("uploadfile")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()

	nowTime := util.GetUnixTime()
	savePath := util.Config.UploadPath + util.GetYmdPath(nowTime)
	if err := util.Mkdir(savePath); err != nil {
		fmt.Printf("mkdir error %s\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// new file name = md5(old filename + nowTime + username)
	saveFile := savePath + util.GetMD5(handler.Filename+util.Int642String(nowTime)+authInfo[0])
	f, err := os.OpenFile(saveFile, os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer f.Close()
	io.Copy(f, file)

	fmt.Fprintf(w, "%v", handler.Header)

	//发送数据到然之服务器，文件名和nowTime
}

func serverInfo(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		fmt.Fprintln(w, "not supported request")
		return
	}
	//该处需要做登录验证

	chatPort, err := util.String2Int(util.Config.ChatPort)
	if err != nil {
		util.LogError().Println("string to int error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	info := vtscInfo{
		Version:   util.Version,
		Token:     string(util.Token),
		SiteType:  util.Config.SiteType,
		ChatPort:  chatPort,
		TestModel: util.IsTest}

	jsonData, err := json.Marshal(info)
	if err != nil {
		util.LogError().Println("json unmarshal error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	fmt.Fprintln(w, string(jsonData))
}
