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
	"xxd/hyperttp"
	"xxd/util"
)

// 从客户端发来的登录请求，通过该函数转发到后台服务器进行登录验证
func ChatLogin(clientData ParseData) ([]byte, int64, bool) {
	// 客户端到go服务器，和go服务器到后台服务器通讯使用了不一样的token
	ranzhiToken := util.Config.RanzhiServer[clientData.ServerName()].RanzhiToken
	ranzhiAddr := util.Config.RanzhiServer[clientData.ServerName()].RanzhiAddr

	// 到http服务器请求，返回加密的结果
	retMessage, err := hyperttp.RequestInfo(ranzhiAddr, apiPartForm(ApiUnparse(clientData, ranzhiToken)))
	if err != nil || retMessage == nil {
		util.LogError().Println("hyperttp request info error:", err)
		return nil, -1, false
	}

	// 解析http服务器的数据,返回 ParseData 类型的数据
	retData := ApiParse(retMessage, ranzhiToken)
	if retData == nil {
		util.LogError().Println("api parse error")
		return nil, -1, false
	}

	retMessage, err = swapToken(retMessage, ranzhiToken, util.Token)
	if err != nil {
		return nil, -1, false
	}

	// 返回值：
	// 1、返回给客户端加密后的数据
	// 2、返回用户的ID
	// 3、返回登录的结果
	return retMessage, retData.userID(), retData.Result() == "success"
}

func ChatLogout(clientData ParseData) {
}

func RepeatLogin() []byte {
	repeatLogin := `{module:  'null',method:  'null',message: 'This account logined in another place.'}`

	message, err := aesEncrypt(repeatLogin, util.Token)
	if err != nil {
		util.LogError().Println("aes encrypt error:", err)
		return nil
	}

	return message
}

func UserGetlist(serverName string, userID int64) ([]byte, error) {
	ranzhiToken := util.Config.RanzhiServer[serverName].RanzhiToken
	ranzhiAddr := util.Config.RanzhiServer[serverName].RanzhiAddr

	// 固定的json格式
	request := []byte(`{"module":"chat","method":"userGetlist",id:` + util.Int642String(userID) + `}`)
	message, err := aesEncrypt(request, ranzhiToken)
	if err != nil {
		util.LogError().Println("aes encrypt error:", err)
		return nil, err
	}

	// 到http服务器请求user get list数据
	retMessage, err := hyperttp.RequestInfo(ranzhiAddr, message)
	if err != nil {
		util.LogError().Println("hyperttp request info error:", err)
		return nil, err
	}

	//由于http服务器和客户端的token不一致，所以需要进行交换
	retData, err := swapToken(retMessage, ranzhiToken, util.Token)
	if err != nil {
		return nil, err
	}

	return retData, nil
}

func Getlist(serverName string, userID int64) ([]byte, error) {
	ranzhiToken := util.Config.RanzhiServer[serverName].RanzhiToken
	ranzhiAddr := util.Config.RanzhiServer[serverName].RanzhiAddr

	// 固定的json格式
	request := []byte(`{"module":"chat","method":"getlist",id:` + util.Int642String(userID) + `}`)
	message, err := aesEncrypt(request, ranzhiToken)
	if err != nil {
		util.LogError().Println("aes encrypt error:", err)
		return nil, err
	}

	// 到http服务器请求get list数据
	retMessage, err := hyperttp.RequestInfo(ranzhiAddr, message)
	if err != nil {
		util.LogError().Println("hyperttp request info error:", err)
		return nil, err
	}

	//由于http服务器和客户端的token不一致，所以需要进行交换
	retData, err := swapToken(retMessage, ranzhiToken, util.Token)
	if err != nil {
		return nil, err
	}

	return retData, nil

}

func BroadcastLogin(data ParseData) {
	// 直接响应登录请求返回的数据
}

func (pd ParseData) ServerName() string {
	params, ok := pd["params"]
	if !ok {
		return ""
	}

	// api中server name在数组固定位置为0
	ret := params.([]interface{})
	return ret[0].(string)
}

func (pd ParseData) Account() string {
	params, ok := pd["params"]
	if !ok {
		return ""
	}

	// api中account在数组固定位置为1
	ret := params.([]interface{})
	return ret[1].(string)
}

func (pd ParseData) Password() string {
	params, ok := pd["params"]
	if !ok {
		return ""
	}

	// api中password在数组固定位置为2
	ret := params.([]interface{})
	return ret[2].(string)
}

func (pd ParseData) Status() string {
	params, ok := pd["params"]
	if !ok {
		return ""
	}

	// api中status在数组固定位置为3
	ret := params.([]interface{})
	return ret[3].(string)
}
