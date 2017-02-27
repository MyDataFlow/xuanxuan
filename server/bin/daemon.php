#!/usr/bin/env php
<?php
/**
 * Start xuanxuan if xuanxuan is not running.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Gang Liu <liugang@cnezsoft.com> 
 * @package     xuanxuan 
 * @version     $Id$
 * @link        http://xuanxuan.chat
 */
$basePath = dirname(dirname(__FILE__));
$username = 'www-data'; // Use the run user of your web server as username.
$xuanxuan = `ps aux|grep 'php $basePath/app/xuanxuan/server.php'|grep -v 'grep'`;
if(empty($xuanxuan))
{
    echo `sudo sudo -u $username $basePath/app/xuanxuan/server.php >> $basePath/tmp/log/xuanxuan.log &`;
}
