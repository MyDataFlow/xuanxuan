<?php
if((strpos($fromVersion, 'pro') === false && $fromVersion < '4_1') or (strpos($fromVersion, 'pro') !== false && $fromVersion < 'pro2_1'))
{
    $this->execSQL($this->app->getBasepath() . 'db' . DS . 'xuanxuan.sql');
}
else
{
    $fromVersion = $this->getXuanxuanVersion();

    $this->upgradeXuanxuan($fromVersion);
}
