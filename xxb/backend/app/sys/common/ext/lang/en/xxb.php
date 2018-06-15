<?php
$lang->welcome   = 'XuanXuan backend';
$lang->ranzhi    = 'XuanXuan';
$lang->agreement = "I have read and agreed to  <a href='http://zpl.pub/page/zplv12.html' target='_blank'>Z PUBLIC LICENSE 1.2</a>, <span class='text-danger'>and will keep the logos and links of XuanXuan.</span>";
$lang->poweredBy = "<a href='http://www.xuan.im/?v=%s' target='_blank'>{$lang->ranzhi} %s</a>";

$lang->menu->dashboard = new stdclass();
$lang->menu->dashboard->user    = 'User|user|admin|';
$lang->menu->dashboard->group   = 'Group|group|browse|';
$lang->menu->dashboard->entry   = 'Entry|entry|admin|';
$lang->menu->dashboard->setting = 'Setting|setting|xuanxuan|';

$lang->menu->sys = $lang->menu->dashboard;

$lang->sys->dashboard->menuOrder[20] = 'user';

unset($lang->entry->menu->webapp);
