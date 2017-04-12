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
	"xxd/util"
)

type vtscInfo struct {
	Version    string `json:"version"`
	Token      string `json:"token"`
	SiteType   string `json:"siteType"`
	CommonPort int    `json:"commonPort"`
}

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

	if err := http.ListenAndServeTLS(addr, crt, key, nil); err != nil {
		util.LogError().Println("ListenAndServe:", err)
	}

}

func fileDownload(w http.ResponseWriter, r *http.Request) {
	/*	token := r.Header.Get("Token")
		if token != util.Token {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
	*/
	r.ParseForm()
	fileName := util.Config.UploadPath + (r.Form["filepath"][0])
	if util.IsNotExist(fileName) || util.IsDir(fileName) {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, util.Config.UploadPath+(r.Form["filepath"][0]))

	return
}

func fileUpload(w http.ResponseWriter, r *http.Request) {
	/*	token := r.Header.Get("Token")
		if token != util.Token {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
	*/

	r.ParseMultipartForm(32 << 20)
	file, handler, err := r.FormFile("uploadfile")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()

	fmt.Fprintf(w, "%v", handler.Header)
	f, err := os.OpenFile("./test/"+handler.Filename, os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer f.Close()
	io.Copy(f, file)
}

func serverInfo(w http.ResponseWriter, r *http.Request) {
	//该处需要做登录验证

	info := vtscInfo{
		Version:    util.Version,
		Token:      string(util.Token),
		SiteType:   util.Config.SiteType,
		CommonPort: util.String2Int64(util.Config.CommonPort)}

	jsonData, err := json.Marshal(info)
	if err != nil {
		util.LogError().Println("json unmarshal error:", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	fmt.Fprintln(w, string(jsonData))
}
