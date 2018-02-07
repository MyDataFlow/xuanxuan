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
)

func CreateUid(serverName string, userID int64, key string) error {

    url := Config.LogPath+"/"+serverName+"/"

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

func GetUid(serverName string, userID string) (string,error) {
    url := Config.LogPath+"/"+serverName+"/"+ userID

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

func DelUid(serverName string, userID string) error {
    url := Config.LogPath+"/"+serverName+"/"+ userID
    err := Rm(url)
    if err != nil {
        LogError().Println("Cannot delete file",url,err)
        return err
    }
    return nil
}
