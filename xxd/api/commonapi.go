/**
 * The commonapi file of api current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     api
 * @link        http://www.zentao.net
 */
package api

import (
    "encoding/json"
    "xxd/util"
)

type ParseData map[string]interface{}

// 对通讯的api进行解析
func ApiParse(message, token []byte) (ParseData, error) {
    jsonData, err := aesDecrypt(message, token)
    if err != nil {
        util.LogError().Println("Warning: message data decrypt error:", err)
        return nil, err
    }

    parseData := make(ParseData)
    if err := json.Unmarshal([]byte(jsonData), &parseData); err != nil {
        util.LogError().Println("Warning: JSON unmarshal error:", err)
        return nil, err
    }

    return parseData, nil
}

// 对通讯的api进行加密
func ApiUnparse(parseData ParseData, token []byte) []byte {
    jsonData, err := json.Marshal(parseData)
    if err != nil {
        util.LogError().Println("json unmarshal error:", err)
        return nil
    }

    message, err := aesEncrypt(jsonData, token)
    if err != nil {
        util.LogError().Println("Warning: message data encrypt error:", err)
        return nil
    }

    return message
}

//交换token加密
func SwapToken(message, fromToken, toToken []byte) ([]byte, error) {
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

//获取module
func (pd ParseData) Module() string {
    ret, ok := pd["module"]
    if !ok {
        return ""
    }

    return ret.(string)
}

//获取method
func (pd ParseData) Method() string {
    ret, ok := pd["method"]
    if !ok {
        return ""
    }

    return ret.(string)
}

//获取userID
func (pd ParseData) UserID() int64 {
    ret, ok := pd["userID"]
    if !ok {
        return -1
    }

    return int64(ret.(float64))
}

//获取result
func (pd ParseData) Result() string {
    ret, ok := pd["result"]
    if !ok {
        return ""
    }

    return ret.(string)
}

//获取版本号
func (pd ParseData) Version() string {
    ret, ok := pd["v"]
    if !ok {
        return ""
    }

    return ret.(string)
}

//用户列表
func (pd ParseData) SendUsers() []int64 {
    // 判断users是否存在
    ret, ok := pd["users"]
    if !ok {
        return nil
    }

    // 对interface类型进行转换
    array := make([]int64, len(ret.([]interface{})))
    for i, v := range ret.([]interface{}) {
        array[i] = int64(v.(float64))
    }

    delete(pd, "users")
    return array
}

//测试
func (pd ParseData) Test() bool {
    ret, ok := pd["test"]
    if !ok {
        return false
    }

    return ret.(bool)
}

//测试
func Testfunc(jsonData string) []byte {
    return nil
}
