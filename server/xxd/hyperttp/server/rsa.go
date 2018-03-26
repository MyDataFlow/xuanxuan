/**
 * The httpserver file of hyperttp current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     util
 * @link        http://www.zentao.net
 */
package server

import (
    "crypto/rand"
    "crypto/rsa"
    "crypto/x509"
    "crypto/x509/pkix"
    "encoding/pem"
    "math/big"
    mrd "math/rand"
    "os"
    "time"
    "xxd/util"
)

type CertInformation struct {
    Country            []string
    Organization       []string
    OrganizationalUnit []string
    EmailAddress       []string
    Province           []string
    Locality           []string
    CommonName         string
    CrtName, KeyName   string
    IsCA               bool
    Names              []pkix.AttributeTypeAndValue
}

var crtInfo = CertInformation{
    Country:            []string{"CN"},
    Organization:       []string{"cnezsoft"},
    OrganizationalUnit: []string{"cnezsoft"},
    EmailAddress:       []string{"pengjiangxiu@cnezsoft.com"},
    Province:           []string{"ShanDong"},
    Locality:           []string{"QingDao"},
    CommonName:         "cnezsoft",
    CrtName:            util.GetProgramName() + ".crt",
    KeyName:            util.GetProgramName() + ".key",
    IsCA:               true}

//SSL证书处理
func CreateSignedCertKey() (string, string, error) {
    crtPath := util.Config.CrtPath + util.GetProgramName() + ".crt"
    keyPath := util.Config.CrtPath + util.GetProgramName() + ".key"

    if !util.IsNotExist(crtPath) && !util.IsNotExist(keyPath) {
        return crtPath, keyPath, nil
    }

    util.Rm(crtPath)
    util.Rm(keyPath)

    crt := newCertificate(crtInfo)
    key, err := rsa.GenerateKey(rand.Reader, 2048)
    if err != nil {
        return "", "", err
    }

    var buf []byte
    buf, err = x509.CreateCertificate(rand.Reader, crt, crt, &key.PublicKey, key)
    if err != nil {
        return "", "", err
    }

    err = write(crtInfo.CrtName, "CERTIFICATE", buf)
    if err != nil {
        return "", "", err
    }

    buf = x509.MarshalPKCS1PrivateKey(key)
    return crtPath, keyPath, write(crtInfo.KeyName, "PRIVATE KEY", buf)
}

//写入
func write(filename, crtType string, p []byte) error {
    filename = util.Config.CrtPath + filename
    err := util.Mkdir(util.Config.CrtPath)
    if err != nil {
        util.LogError().Println("certificate dir create err,", err)
    }

    fileHandle, err := os.Create(filename)
    defer fileHandle.Close()
    if err != nil {
        return err
    }
    var b *pem.Block = &pem.Block{Bytes: p, Type: crtType}
    return pem.Encode(fileHandle, b)
}

//证书信息
func newCertificate(info CertInformation) *x509.Certificate {
    return &x509.Certificate{
        SerialNumber: big.NewInt(mrd.Int63()),
        Subject: pkix.Name{
            Country:            info.Country,
            Organization:       info.Organization,
            OrganizationalUnit: info.OrganizationalUnit,
            Province:           info.Province,
            CommonName:         info.CommonName,
            Locality:           info.Locality,
            ExtraNames:         info.Names,
        },
        NotBefore:             time.Now(),                   //证书的开始时间
        NotAfter:              time.Now().AddDate(20, 0, 0), //证书的结束时间
        BasicConstraintsValid: true,                         //基本的有效性约束
        IsCA:           info.IsCA,                                                                  //是否是根证书
        ExtKeyUsage:    []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth}, //证书用途
        KeyUsage:       x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
        EmailAddresses: info.EmailAddress,
    }
}
