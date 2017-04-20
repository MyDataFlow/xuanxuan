<?php
class api extends control
{
    /**
     * Parse the request.
     * 
     * @access public
     * @return void
     */
    public function parseRequest()
    {
        $this->app->setModuleName($module);
        $this->app->setMethodName($method);
        $this->app->setControlFile();
        $this->app->setViewType();
    }

    public function xuanxuan()
    {
        $data = file_get_contents("php://input");
        $key  = '12345678888888888888888888888888';
        $iv   = substr($key, 0, 16);
        echo $data . "\n";
        $data = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $data, MCRYPT_MODE_CBC, $iv);
        echo $data;
    }
}
