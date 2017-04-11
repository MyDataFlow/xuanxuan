/**
 * The httpserver file of http current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     util
 * @link        http://www.zentao.net
 */
package hyperttp

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"xxd/util"
)

const (
	download = "/download"
	upload   = "/upload"
	sType    = "/servertype"
	token    = "/gettoken"
)

func Initdd() {
	http.HandleFunc(download, fileDownload)
	http.HandleFunc(upload, fileUpload)
	http.HandleFunc(token, getToken)
	http.HandleFunc(sType, serverType)

	addr := util.Config.Ip + ":" + util.Config.UploadPort
	util.LogInfo().Println("http server start,listen addr:", addr, download)
	err := http.ListenAndServe(addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe:", err)
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

func getToken(w http.ResponseWriter, r *http.Request) {
}

func serverType(w http.ResponseWriter, r *http.Request) {
}
