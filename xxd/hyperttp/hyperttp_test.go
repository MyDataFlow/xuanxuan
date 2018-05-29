package hyperttp

import (
    "testing"
    "xxd/api"
)

// go test -v hyperttp*

// 解密成功后，内容是{module:  'null',method:  'null',message: 'This account logined in another place.'}
// User-Agent:[easysoft-xxdClient/0.1]
// Content-Length:[96]
// Content-Type:[application/x-www-form-urlencoded]
// Accept-Encoding:[gzip]
func TestClient(t *testing.T) {
    addr := "http://127.0.0.1/xxb/xuanxuan.php"
    //postData := []byte("123456789")

    postData := api.RepeatLogin()
    body, err := RequestInfo(addr, postData)
    if err != nil {
        t.Error(err)
    }

    t.Log("----------------")
    //t.Error(string(body), postData)
    t.Log(string(body), postData)
}
