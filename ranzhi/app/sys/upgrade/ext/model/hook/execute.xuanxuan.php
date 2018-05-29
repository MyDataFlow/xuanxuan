<?php
if((strpos($fromVersion, 'pro') === false && $fromVersion < '4_1') or (strpos($fromVersion, 'pro') !== false && $fromVersion < 'pro2_1'))
{
    $this->execSQL($this->app->getBasepath() . 'db' . DS . 'xuanxuan.sql');
}
else
{
    $xuanxuanVersion = !empty($this->config->xuanxuan->global->version) ? $this->config->xuanxuan->global->version : '1.0';
    switch($xuanxuanVersion)
    {
        case '1.0'   : $this->execSQL($this->getUpgradeFile('xuanxuan1.0'));
        case '1.1.0' :
        case '1.1.1' : $this->execSQL($this->getUpgradeFile('xuanxuan1.1.1'));
        case '1.3.0' : $this->execSQL($this->getUpgradeFile('xuanxuan1.3.0'));
        case '1.4.0' : $this->execSQL($this->getUpgradeFile('xuanxuan1.4.0'));
        default : $this->loadModel('setting')->setItem('system.sys.xuanxuan.global.version', $this->config->xuanxuan->version);
    }
}
