/**
 * The aes file of test current module of xxd.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Archer Peng <pengjiangxiu@cnezsoft.com>
 * @package     main
 * @link        http://www.zentao.net
 */
package main

import (
    "bytes"
    "crypto/aes"
    "crypto/cipher"
    "fmt"
)

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

func aesDecrypt(crypted, key []byte) ([]byte, error) {

    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }

    blockSize := block.BlockSize()
    cryptedSize := len(crypted)
    if cryptedSize == 0 || cryptedSize%blockSize != 0 {
        return nil, fmt.Errorf("%s\n", "input not full blocks")
    }

    blockMode := cipher.NewCBCDecrypter(block, key[:blockSize])
    origData := make([]byte, cryptedSize)
    // origData := crypted
    blockMode.CryptBlocks(origData, crypted)
    origData = pkcs5UnPadding(origData)
    if origData == nil {
        return nil, fmt.Errorf("%s\n", "pkcs5 UnPadding error")
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
        fmt.Println("aes unpadding len > data length")
        return nil
    }

    return origData[:(length - unpadding)]
}
