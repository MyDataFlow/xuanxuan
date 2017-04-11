/**
 * The aes file of api current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     util
 * @link        http://www.zentao.net
 */
package api

import (
	"encoding/json"
	"xxd/util"
)

type ParseData map[string]interface{}

type partForm struct {
	Message []byte `json:message`
}

// 对通讯的api进行解析
func ApiParse(message, token []byte) ParseData {
	jsonData, err := aesDecrypt(message, token)
	if err != nil {
		util.LogError().Println("aes decrypt error:", err)
		return nil
	}

	parseData := make(ParseData)
	if err := json.Unmarshal([]byte(jsonData), &parseData); err != nil {
		util.LogError().Println("json unmarshal error:", err)
		return nil
	}

	return parseData
}

// 对通讯的api进行加密
func apiUnparse(parseData ParseData, token []byte) []byte {
	jsonData, err := json.Marshal(parseData)
	if err != nil {
		util.LogError().Println("json unmarshal error:", err)
		return nil
	}

	message, err := aesEncrypt(jsonData, token)
	if err != nil {
		util.LogError().Println("aes encrypt error:", err)
		return nil
	}

	return message
}

func apiPartForm(cryptData []byte) []byte {
	partFromData := partForm{Message: cryptData}

	jsonData, err := json.Marshal(partFromData)
	if err != nil {
		util.LogError().Println("json unmarshal error:", err)
		return nil
	}

	return jsonData
}

//交换token加密
func swapToken(message, fromToken, toToken []byte) ([]byte, error) {
	jsonData, err := aesDecrypt(message, fromToken)
	if err != nil {
		util.LogError().Println("aes decrypt error:", err)
		return nil, err
	}

	message, err = aesEncrypt(jsonData, toToken)
	if err != nil {
		util.LogError().Println("aes encrypt error:", err)
		return nil, err
	}

	return message, nil
}

func (pd ParseData) Module() string {
	ret, ok := pd["module"]
	if !ok {
		return ""
	}

	return ret.(string)
}

func (pd ParseData) Method() string {
	ret, ok := pd["method"]
	if !ok {
		return ""
	}

	return ret.(string)
}

func (pd ParseData) Result() string {
	ret, ok := pd["result"]
	if !ok {
		return ""
	}

	return ret.(string)
}

func (pd ParseData) SendUsers() ([]string, string) {
	// 判断users是否存在
	ret, ok := pd["users"]
	if !ok {
		return nil, ""
	}

	// 判断类型
	switch ret.(type) {
	case string:
		//all 表示发送给所有用户
		if ret == "all" {
			return nil, "broadcast"
		}
	}

	// 对interface类型进行转换
	strArray := make([]string, len(ret.([]interface{})))
	for i, v := range ret.([]interface{}) {
		str := util.Int642String(int64(v.(float64)))
		strArray[i] = str
	}

	return strArray, "multicast"
}
