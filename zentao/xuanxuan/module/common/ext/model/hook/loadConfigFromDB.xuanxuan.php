<?php
$sn = $this->loadModel('setting')->getItem('owner=system&module=xuanxuan&key=key');
if(empty($sn)) $this->loadModel('setting')->setItem('system.xuanxuan..key', $this->loadModel('setting')->computeSN());