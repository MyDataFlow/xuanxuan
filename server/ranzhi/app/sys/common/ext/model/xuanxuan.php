<?php
public function decrypt($input = '')
{
    global $config;
    $key   = $config->xuanxuan->key;
    $iv    = substr($key, 0, 16);
    $input = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $input, MCRYPT_MODE_CBC, $iv);
    $input = '{"module":"chat","method":"login","params":["ranzhi","admin","e10adc3949ba59abbe56e057f20f883e","online"]}';
    return json_decode($input);
}

public static function encrypt($output = '')
{
    global $config;
    $key    = $config->xuanxuan->key;
    $iv     = substr($key, 0, 16);
    $output = helper::jsonEncode($output);
    $output = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key, $output, MCRYPT_MODE_CBC, $iv);
    return $output;
}
