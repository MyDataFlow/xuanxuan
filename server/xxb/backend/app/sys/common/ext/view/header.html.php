<?php
/**
 * The header view of common module of RanZhi.
 *
 * @copyright   Copyright 2009-2018 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Chunsheng Wang <chunsheng@cnezsoft.com>
 * @package     common
 * @version     $Id: header.html.php 4029 2016-08-26 06:50:41Z liugang $
 * @link        http://www.ranzhi.org
 */
?>
<?php if($extView = $this->getExtViewFile(__FILE__)){include $extView; return helper::cd();}?>
<?php include '../../view/header.lite.html.php';?>
<style>body {padding-top: 58px;}</style>
<nav class='navbar navbar-main navbar-fixed-top' id='mainNavbar'>
  <div class='collapse navbar-collapse'>
    <ul class='nav navbar-nav'>
      <li><?php echo html::a($this->createLink('user', 'profile'), "<i class='icon-user'></i> " . $app->user->realname, "data-toggle='modal' data-id='profile'");?></li>
    </ul>
    <?php echo commonModel::createMainMenu($this->moduleName);?>
    <ul class='nav navbar-nav navbar-right'>
      <li><?php echo html::a($this->createLink('user', 'logout'), "<i class='icon icon-signout'></i> {$lang->logout}", 'target="_parent"')?></li>
    </ul>
  </div>
</nav>
<?php
if(!isset($moduleMenu)) $moduleMenu = commonModel::createModuleMenu($this->moduleName);
if($moduleMenu) echo "$moduleMenu\n<div class='row page-content with-menu'>\n"; else echo "<div class='row page-content'>";
?>

