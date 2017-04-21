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

func (pd ParseData) UserID() int64 {
	data, ok := pd["data"]
	if !ok {
		return -1
	}

	intfData := data.(map[string]interface{})
	ret := int64(intfData["id"].(float64))
	return ret
}

// 需要重新构思，多然之时，不能因为一个登陆失败就导致所有的不能登录。
// 是否考虑可以自动重连。
// 需要考虑登录成功后，然之服务器掉线的处理方式
func StartXXD() error {
	startXXD := []byte(`{module:  'null',method:  'null',message: 'This account logined in another place.'}`)

	for serverName, serverInfo := range util.Config.RanzhiServer {
		message, err := aesEncrypt(startXXD, serverInfo.RanzhiToken)
		if err != nil {
			util.LogError().Printf("aes encrypt error:%s,ranzhi %s server login err", err, serverName)
			return err
		}

		_, err = hyperttp.RequestInfo(serverInfo.RanzhiAddr, message)
		if err != nil {
			util.LogError().Printf("aes encrypt error:%s,ranzhi %s server login err", err, serverName)
			return err
		}
	}

	return nil
}
