<?php
$lang->welcome   = '喧喧后台管理系统';
$lang->ranzhi    = '喧喧';
$lang->agreement = "已阅读并同意<a href='http://zpl.pub/page/zplv12.html' target='_blank'>《Z PUBLIC LICENSE授权协议1.2》</a>。<span class='text-danger'>未经许可，不得去除、隐藏或遮掩喧喧系统的任何标志及链接。</span>";
$lang->poweredBy = "<a href='http://www.xuan.im/?v=%s' target='_blank'>{$lang->ranzhi}%s</a>";

$lang->menu->dashboard = new stdclass();
$lang->menu->dashboard->user    = '组织|user|admin|';
$lang->menu->dashboard->group   = '权限|group|browse|';
$lang->menu->dashboard->entry   = '应用|entry|admin|';
$lang->menu->dashboard->setting = '设置|setting|xuanxuan|';

$lang->menu->sys = $lang->menu->dashboard;

$lang->sys->dashboard->menuOrder[10] = 'user';

unset($lang->entry->menu->webapp);

