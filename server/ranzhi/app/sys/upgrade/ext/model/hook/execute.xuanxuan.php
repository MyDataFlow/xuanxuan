<?php
$xuanxuanVersion = !empty($this->config->xuanxuan->global->version) ? $this->config->xuanxuan->global->version : '1.0';

switch($xuanxuanVersion)
{
case '1.0' : $this->execSQL($this->getUpgradeFile('xuanxuan1.0'));
case '1.1.0':
default: $this->loadModel('setting')->setItem('system.sys.xuanxuan.global.version', $this->config->xuanxuan->version);
}
