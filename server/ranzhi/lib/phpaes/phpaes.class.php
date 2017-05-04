<?php
define('PHPAES_ROOT', dirname(__FILE__));

include PHPAES_ROOT . '/phpseclib/Crypt/AES.php';
class phpAES
{
    CONST MODE_CBC = 2;

    public function init($key, $iv)
    {
        $this->aes = new AES(self::MODE_CBC);
        $this->aes->setKey($key);
        $this->aes->setIV($iv);
    }

    public function encrypt($output)
    {
        return $this->aes->encrypt($output);
    }

    public function decrypt($input)
    {
        return $this->aes->decrypt($input);
    }
}
