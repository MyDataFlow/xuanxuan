/**
 * The assemblage file of util current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     util
 * @link        http://www.zentao.net
 */
package util

import (
    "crypto/md5"
    "encoding/hex"
    "os"
    "path/filepath"
    "strconv"
    "time"
)

const (
    KB = 1024
    MB = 1024 * KB
    GB = 1024 * MB
)

func GetYmd() string {
    return time.Now().Format("20060102")
}

func GetYmdPath(timeStamp int64) string {
    if timeStamp == 0 {
        return time.Now().Format("2006/01/02/")
    }

    return time.Unix(timeStamp, 0).Format("2006/01/02/")
}

func GetUnixTime() int64 {
    return time.Now().Unix()
}

func GetMD5(str string) string {
    md5H := md5.New()
    md5H.Write([]byte(str))
    cipherStr := md5H.Sum(nil)

    return hex.EncodeToString(cipherStr)
}

func GetProgramName() string {
    return filepath.Base(os.Args[0])
}

func Sleep(second int) {
    time.Sleep(time.Duration(second) * time.Second)
}

func SleepMillisecond(Millisecond int) {
    time.Sleep(time.Duration(Millisecond) * time.Millisecond)
}

func Mkdir(path string) error {
    if IsNotExist(path) {
        err := os.MkdirAll(path, os.ModePerm)
        if err != nil {
            return err
        }
    }

    return nil
}

func IsNotExist(path string) bool {
    _, err := os.Stat(path)
    if err != nil {
        return true
    }

    return false
}

func IsDir(path string) bool {
    info, err := os.Stat(path)
    if err == nil && info.IsDir() {
        return true
    }

    return false
}

func FileBaseName(path string) string {
    return filepath.Base(path)
}

func Rm(path string) error {
    err := os.Remove(path)
    if err != nil {
        return err
    }

    return nil
}

func String2Int(str string) (int, error) {
    return strconv.Atoi(str)
}

func Int2String(i int) string {
    return strconv.Itoa(i)
}

func String2Int64(str string) (int64, error) {
    return strconv.ParseInt(str, 10, 64)
}

func Int642String(i int64) string {
    return strconv.FormatInt(i, 10)
}
