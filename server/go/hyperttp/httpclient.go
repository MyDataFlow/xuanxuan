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
	"bytes"
	"crypto/tls"
	"io/ioutil"
	"net/http"
	"xxd/util"
)

const https = "https:"

func RequestInfo(addr string, postData []byte) ([]byte, error) {
	if postData == nil {
		return nil, util.Errorf("%s", "post data is null\n")
	}

	var client *http.Client
	if addr[:6] == https {
		client = httpRequest()
	} else {
		client = httpsRequest()
	}

	req, err := http.NewRequest("POST", addr, bytes.NewReader(postData))
	//request.Header.Set("Content-type", "application/json")
	req.Header.Set("User-Agent", "easysoft-client/0.1")
	//req.Header.Add("User-Agent", "easysoft")
	resp, err := client.Do(req)
	if err != nil {
		util.LogError().Printf("request addr [%s] error:", addr, err)
		return nil, err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		util.LogError().Println("request body read error:", err)
		return nil, err
	}

	if len(body) == 0 {
		util.LogError().Println("request body len is zero")
		return nil, util.Errorf("request body len is zero")
	}

	return body, nil
}

func httpRequest() *http.Client {
	return &http.Client{}
}

func httpsRequest() *http.Client {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}

	return &http.Client{Transport: tr}
}
