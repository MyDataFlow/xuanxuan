<?php
/**
 * The index view file of index module of RanZhi.
 *
 * @copyright   Copyright 2009-2018 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Yidong Wang <yidong@cnezsoft.com>
 * @package     index
 * @version     $Id: index.html.php 4205 2016-10-24 08:19:13Z liugang $
 * @link        http://www.ranzhi.org
 */
include "../../../common/view/header.lite.html.php";
js::import($jsRoot . 'jquery/ips.js');
$isSuperAdmin = $this->app->user->admin == 'super';
js::set('attend', commonModel::isAvailable('attend') ? 1 : 0);
?>
<style>#home > .navbar{left:0!important;}.fullscreen{z-index: unset;}</style>
<!-- Desktop -->
<div id='desktop' class='fullscreen-mode'>
  <div id='bottomBar' class='dock-bottom unselectable' style="left:0;">
    <div id='taskbar'><ul class='bar-menu'></ul></div>
    <div id='bottomRightBar' class='dock-right'>
      <div class='copyright'><?php printf($lang->poweredBy, $this->config->version, ' ' . $this->config->version)?></div>
    </div>
  </div>
  <div id='home' class='fullscreen fullscreen-active unselectable'>
    <nav class='navbar navbar-main navbar-fixed-top' id='mainNavbar'>
      <div class='collapse navbar-collapse'>
        <ul class='nav navbar-nav'>
          <li><?php echo html::a($this->createLink('user', 'profile'), "<i class='icon-user'></i> " . $app->user->realname, "data-toggle='modal' data-id='profile'");?></li>
        </ul>
        <?php echo commonModel::createDashboardMenu();?>
        <ul class='nav navbar-nav navbar-right'>
          <li><?php echo html::a($this->createLink('user', 'logout'), "<i class='icon icon-signout'></i> {$lang->logout}")?></li>
        </ul>
      </div>
    </nav>
    <div id='dashboardWrapper'>
      <div class='panels-container dashboard' id='dashboard' data-confirm-remove-block='<?php  echo $lang->block->confirmRemoveBlock;?>'>
        <div class='row'>
          <?php
          $index = 0;
          reset($blocks);
          ?>
          <?php foreach($blocks as $key => $block):?>
          <?php
          $index = $key;
          ?>
          <div class='col-xs-<?php echo $block->grid;?> pull-left'>
          <div class='panel <?php if(isset($block->params->color)) echo 'panel-' . $block->params->color;?>' id='block<?php echo $index?>' data-id='<?php echo $index?>' data-blockid='<?php echo $block->id?>' data-name='<?php echo $block->title?>' data-url='<?php echo $this->createLink('entry', 'printBlock', 'index=' . $index) ?>' <?php if(!empty($block->height)) echo "data-height='$block->height'";?>>
              <div class='panel-heading'>
                <div class='panel-actions'>
                  <?php if(isset($block->moreLink) and isset($block->appid)) echo html::a($block->moreLink, $lang->more . "<i class='icon-double-angle-right'></i>", "class='more app-btn' data-id='{$block->appid}'");?>
                  <button class="btn btn-mini refresh-panel" type='button'><i class="icon-repeat"></i></button>
                  <div class='dropdown'>
                    <button role="button" class="btn btn-mini" data-toggle="dropdown" type='button'><span class="caret"></span></button>
                    <ul class="dropdown-menu pull-right" role="menu">
                      <li><a href="<?php echo $this->createLink("block", "admin", "index=$index"); ?>" data-toggle='modal' class='edit-block' data-title='<?php echo $block->title; ?>' data-icon='icon-pencil'><i class="icon-pencil"></i> <?php echo $lang->edit; ?></a></li>
                      <li><a href="javascript:;" class="remove-panel"><i class="icon-remove"></i> <?php echo $lang->delete; ?></a></li>
                      <?php if(!$block->source and $block->block == 'html'):?>
                        <li><a href="javascript:hiddenBlock(<?php echo $index;?>)" class="hidden-panel"><i class='icon-eye-close'></i> <?php echo $lang->index->hidden; ?></a></li>
                      <?php endif;?>
                    </ul>
                  </div>
                </div>
                <?php echo $block->title?>
              </div>
              <div class='panel-body no-padding'></div>
            </div>
          </div>
          <?php endforeach;?>
        </div>
      </div>
    </div>
  </div>
  <div id='deskContainer'></div>
  <div id='modalContainer'></div>
</div>
<div id='noticeBox'>
  <?php //echo $notice;?>
</div>
<div id='categoryTpl' class='hide'>
  <ul id='categoryMenucategoryid' class='category categoryMenu dropdown-menu fade' data-id='categoryid'></ul>
</div>
<script>
<?php $dashboardMenu = (isset($dashboard) and isset($dashboard->visible) and $dashboard->visible == 0) ? 'list' : 'all';?>
var entries = [
{
    id        : 'dashboard',
    code      : 'dashboard',
    name      : '<?php echo $lang->index->dashboard;?>',
    abbr      : '<?php echo $lang->index->dashboardAbbr;?>',
    open      : 'iframe',
    desc      : '<?php echo $lang->index->dashboard?>',
    menu      : '<?php echo $dashboardMenu;?>',
    sys       : true,
    icon      : 'icon-home',
    url       : '<?php echo $this->createLink('todo', 'calendar')?>',
    order     : 0,
},
{
    id        : 'allapps',
    code      : 'allapps',
    name      : '<?php echo $lang->index->allEntries?>',
    display   : 'fullscreen',
    desc      : '<?php echo $lang->index->allEntries?>',
    menu      : 'menu',
    icon      : 'icon-th-large',
    sys       : true,
    forceMenu : true,
    order     : 9999999
},
{
    id        : 'home',
    code      : 'home',
    name      : '<?php echo $title?>',
    display   : 'fullscreen',
    menu      : 'none',
    icon      : 'icon-desktop',
    sys       : true,
    forceMenu : true,
    order     : 9999998
}];

<?php if($isSuperAdmin || commonModel::hasAppPriv('superadmin')):?>
<?php $superadminMenu  = (isset($superadmin) and isset($superadmin->visible) and $superadmin->visible == 0) ? 'list' : 'all';?>

entries.push(
{
    id    : 'dashboard',
    code  : 'superadmin',
    name  : '<?php echo $lang->index->dashboard;?>',
    open  : 'iframe',
    desc  : '<?php echo $lang->index->dashboard?>',
    menu  : '<?php echo $superadminMenu;?>',
    sys   : true,
    icon  : 'icon-home',
    url   : "<?php echo $this->createLink('admin')?>",
    order : 0
});
<?php endif;?>

var ipsLang = {};
<?php
foreach ($lang->index->ips as $key => $value)
{
    echo 'ipsLang["' . $key . '"] = "' . $value . '";';
}
?>
<?php echo $allEntries;?>
</script>
<?php include "../../../common/view/footer.html.php"; ?>
