/**
 * The hyperttp file of hyperttp current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     hyperttp
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
const requestCount = 3

func RequestInfo(addr string, postData []byte) ([]byte, error) {
	if postData == nil || addr == "" {
		return nil, util.Errorf("%s", "post data or addr is null")
	}

	var client *http.Client
	if addr[:6] != https {
		client = httpRequest()
	} else {
		client = httpsRequest()
	}

	var i int = 0
	var resp *http.Response

	for i = 0; i < requestCount; i++ {
		req, err := http.NewRequest("POST", addr, bytes.NewReader(postData))
		if err != nil {
			util.LogError().Printf("http new request error, addr [%s] error:%v", addr, err)
		}

		req.Header.Set("Content-type", "application/x-www-form-urlencoded")
		req.Header.Set("User-Agent", "easysoft-xxdClient/"+util.Version)
		resp, err = client.Do(req)
		if err != nil {
			util.LogError().Printf("request addr [%s] error:%v", addr, err)

			util.SleepMillisecond(200)
			continue
		}

		// StatusOK == 200
		if resp.StatusCode == http.StatusOK {
			break
		}

		util.LogError().Printf(" request status code:%v", resp.StatusCode)
		util.SleepMillisecond(200)
	}

	if i >= requestCount {
		return nil, util.Errorf("%s", "http request error, request count > 3")
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		util.LogError().Println("request body read error:", err)
		return nil, err
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
