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

func (pd ParseData) userID() int64 {
	data, ok := pd["data"]
	if !ok {
		return -1
	}

	intfData := data.(map[string]interface{})
	ret := int64(intfData["id"].(float64))
	return ret
}
