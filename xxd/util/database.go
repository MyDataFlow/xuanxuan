/**
 * The database file of util current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Memory <memory@cnezsoft.com>
 * @package     util
 * @link        http://www.zentao.net
 */
package util

import (
    "database/sql"
    _ "github.com/mattn/go-sqlite3"
    "os"
    "strconv"
    "strings"
)

func InitDB() *sql.DB {
    dir, _ := os.Getwd()
    DB, err := sql.Open("sqlite3", dir+"/config/xxd.db")
    if err != nil {
        LogError().Println("SQLite connect error", err)
    }
    return DB
}

func DBInsertOffline(server string, userID int64) {
    stmt, err := DBConn.Prepare("INSERT INTO offline(server, userID) values(?,?)")
    if err != nil {
        LogError().Println("SQLite insert offline error", err)
    }
    stmt.Exec(server, userID)
}

func DBUserLogin(server string, userID int64) {
    _, err := DBConn.Exec("DELETE FROM offline WHERE `server` = '" + server + "' AND `userID` = '" + Int642String(userID) + "'")
    if err != nil {
        LogError().Println("SQLite delete offline user error", err)
    }
}

func DBInsertSendfail(server string, userID int64, gid string) {
    stmt, err := DBConn.Prepare("INSERT INTO sendfail(server, userID, gid) values(?,?,?)")
    if err != nil {
        LogError().Println("SQLite insert sendfail error", err)
    }
    stmt.Exec(server, userID, gid)
}

func DBSelectOffline(server string) ([]int, error) {
    rows, err := DBConn.Query("SELECT `userID` FROM offline WHERE `server` = '" + server + "'")

    if err != nil {
        LogError().Println("SQLite Query offline error", err)
        return []int{}, err
    }

    var dict []int

    for rows.Next() {
        var userID int
        err := rows.Scan(&userID)
        if err != nil {
            LogError().Println("SQLite scan offline userID error", err)
            return []int{}, err
        }
        dict = append(dict, userID)
    }
    return dict, nil
}

func DBSelectSendfail(server string) (map[int][]string, error) {
    rows, err := DBConn.Query("SELECT `userID`,`gid` FROM sendfail WHERE `server` = '" + server + "'")

    if err != nil {
        LogError().Println("SQLite Query sendfail error", err)
        return nil, err
    }
    dict := make(map[int][]string)
    for rows.Next() {
        var userID int
        var gid string
        err := rows.Scan(&userID, &gid)
        if err != nil {
            LogError().Println("SQLite scan sendFail userID or gid error", err)
            return nil, err
        }
        dict[userID] = append(dict[userID], gid)
    }
    return dict, nil
}

func DBDeleteOffline(server string, userID []int) {
    if len(userID) == 0 {
        return
    }

    var IDs []string
    for _, id := range userID {
        IDs = append(IDs, strconv.Itoa(id))
    }

    _, err := DBConn.Exec("DELETE FROM offline WHERE `server` = '" + server + "' AND `userID` IN (" + strings.Join(IDs, ",") + ")")
    if err != nil {
        LogError().Println("SQLite DELETE offline users error:", err)
    }
}

func DBDeleteSendfail(server string, gid map[int][]string) {
    for userID, gids := range gid {
        if len(gids) > 0 {
            in := "'" + strings.Join(gids, "','") + "'"
            _, err := DBConn.Exec("DELETE FROM sendfail WHERE `server` = '" + server + "' AND `userID` = " + string(userID) + " AND `gid` IN (" + in + ")")
            if err != nil {
                LogError().Println("SQLite DELETE sendfail messages error:", err)
            }
        }
    }
}
