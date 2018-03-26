/**
 * The log file of util current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Memory <lvtoa@cnezsoft.com>
 * @package     util
 * @link        http://www.zentao.net
 */
package util

import (
    "os"
    "io/ioutil"
    "strconv"
)

//生成唯一ID 作用于文件在websocket和http不同协议中识别用户
func CreateUid(serverName string, userID int64, key string) error {

    url := Config.LogPath + serverName + "/"

    if err := Mkdir(url); err != nil {
        LogError().Println("mkdir error %s\n", err)
        return err
    }

    fileName := url + Int642String(userID)

    fout,err := os.Create(fileName)
    defer fout.Close()
    if err != nil {
        LogError().Println("Create file error",fileName,err)
        return err
    }

    LogInfo().Println("Session file:", fileName)
    fout.WriteString(key)
    LogInfo().Println("Session created:", key)

    return nil
}

//获取用户唯一ID
func GetUid(serverName string, userID string) (string,error) {
    url := Config.LogPath + serverName + "/" + userID

    _, err := os.Stat(url)
    if err != nil && os.IsNotExist(err) {
        userIDint, _ := strconv.ParseInt(userID, 10, 64)
        CreateUid(serverName, userIDint, GetMD5(serverName + userID))
    }

    file, err := os.Open(url)
    if err != nil {
        LogError().Println("Cannot open file",url,err)
        return "",err
    }
    data, err := ioutil.ReadAll(file)
    if err != nil {
        LogError().Println("Cannot read file",url,err)
        return "",err
    }
    return string(data),nil
}

//删除用户唯一ID
func DelUid(serverName string, userID string) error {
    url := Config.LogPath + serverName + "/" + userID
    err := Rm(url)
    if err != nil {
        LogError().Println("Cannot delete file",url,err)
        return err
    }
    return nil
}
