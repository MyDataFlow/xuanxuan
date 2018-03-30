<?php
if($this->config->attend->signInClient == 'xuanxuan' && strpos($_SERVER['HTTP_USER_AGENT'], 'easysoft/xuan.im') === false) 
{
    return array('result' => 'fail', 'message' => sprintf($this->lang->attend->signInClientError, $this->lang->attend->clientList[$this->config->attend->signInClient]));
}
