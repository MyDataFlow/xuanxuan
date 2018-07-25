<?php
public function execute($fromVersion)
{
    $xxbVersion = !empty($this->config->version) ? $this->config->version : '1.0';
    switch($xxbVersion)
    {
        case '1.2' : $this->execSQL($this->getUpgradeFile('upgradexxb1.2.sql'));
        default : $this->loadModel('setting')->updateVersion($this->config->version);
    }
}
