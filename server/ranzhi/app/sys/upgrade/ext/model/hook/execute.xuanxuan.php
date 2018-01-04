<?php
if($fromVersion < '4_1') 
{
    $this->execSQL($this->app->getBasepath() . 'db' . DS . 'xuanxuan.sql');
}
else
{
    $xuanxuanVersion = !empty($this->config->xuanxuan->global->version) ? $this->config->xuanxuan->global->version : '1.0';
    switch($xuanxuanVersion)
    {
    case '1.0' : $this->execSQL($this->getUpgradeFile('xuanxuan1.0'));
    case '1.1.0' :
    case '1.1.1' : $this->execSQL($this->getUpgradeFile('xuanxuan1.1.1'));
    default : $this->loadModel('setting')->setItem('system.sys.xuanxuan.global.version', $this->config->xuanxuan->version);
    }
}
