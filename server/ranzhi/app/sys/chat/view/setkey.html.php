<?php
/**
 * The settings view file of chat module of RanZhi.
 *
 * @copyright   Copyright 2009-2017 青岛易软天创网络科技有限公司(QingDao Nature Easy Soft Network Technology Co,LTD, www.cnezsoft.com)
 * @license     ZPL (http://zpl.pub/page/zplv12.html)
 * @author      Gang Liu <liugang@cnezsoft.com>
 * @package     chat 
 * @version     $Id$
 * @link        http://www.ranzhico.com
 */
?>
<?php include '../../common/view/header.html.php';?>
<div class='panel'>
  <form id='ajaxForm' method='post'>
    <table class='table table-form w-p40'>
      <tr>
        <th class='w-80px'><?php echo $lang->chat->version;?></th>
        <td><?php echo $config->xuanxuan->version;?></td>
      </tr>
      <tr>
        <th><?php echo $lang->chat->key;?></th>
        <td><?php echo html::input('key', $config->xuanxuan->key, "class='form-control'");?></td>
      </tr>
      <tr>
        <th></th>
        <td><?php echo html::submitButton();?></td>
      </tr>
    </table>
  </form>
</div>
<?php include '../../common/view/footer.html.php';?>
