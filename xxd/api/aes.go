/**
 * The aes file of api current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     api
 * @link        http://www.zentao.net
 */
package api

import (
    "bytes"
    "crypto/aes"
    "crypto/cipher"
    "xxd/util"
)

//ase加密
func aesEncrypt(origData, key []byte) ([]byte, error) {
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }
    blockSize := block.BlockSize()
    origData = pkcs5Padding(origData, blockSize)
    blockMode := cipher.NewCBCEncrypter(block, key[:blockSize])
    crypted := make([]byte, len(origData))
    // 根据CryptBlocks方法的说明，如下方式初始化crypted也可以
    // crypted := origData
    blockMode.CryptBlocks(crypted, origData)
    return crypted, nil
}

//ase解密
func aesDecrypt(crypted, key []byte) ([]byte, error) {
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }

    blockSize := block.BlockSize()
    cryptedSize := len(crypted)
    if cryptedSize == 0 || cryptedSize%blockSize != 0 {
        return nil, util.Errorf("%s\n", "input not full blocks")
    }

    blockMode := cipher.NewCBCDecrypter(block, key[:blockSize])
    origData := make([]byte, cryptedSize)
    // origData := crypted
    blockMode.CryptBlocks(origData, crypted)
    origData = pkcs5UnPadding(origData)
    if origData == nil {
        return nil, util.Errorf("%s\n", "pkcs5 UnPadding error")
    }

    return origData, nil
}

func pkcs5Padding(ciphertext []byte, blockSize int) []byte {
    padding := blockSize - len(ciphertext)%blockSize
    padtext := bytes.Repeat([]byte{byte(padding)}, padding)
    return append(ciphertext, padtext...)
}

func pkcs5UnPadding(origData []byte) []byte {
    length := len(origData)
    // 去掉最后一个字节 unpadding 次
    unpadding := int(origData[length-1])
    if unpadding > length {
        util.LogError().Println("aes unpadding len > data length")
        return nil
    }

    return origData[:(length - unpadding)]
}
