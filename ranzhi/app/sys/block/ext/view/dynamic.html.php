<table class='table table-condensed table-hover table-striped table-borderless table-fixed'>
  <?php 
  foreach($actions as $action)
  {
      $user = isset($users[$action->actor]) ? $users[$action->actor] : $action->actor;
      if(strpos(',login,loginxuanxuan,logout,logoutxuanxuan,', ",$action->action,") !== false) $action->objectName = $action->objectLabel = '';
      $attr = (empty($action->toggle) and $action->appName != 'sys') ? "class='app-btn' data-id='{$action->appName}' data-url='{$action->objectLink}'" : '';
      echo "<tr $attr>";
      echo "<td class='nobr' width='100%'>";
      printf($lang->block->dynamicInfo, $action->date, $user, $action->actionLabel, $action->objectLabel, $action->objectLink, $action->toggle, $action->objectName);
      echo "</td></tr>";
  }
 ?>
</table>
