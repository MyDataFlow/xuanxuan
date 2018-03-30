<?php
$lang->appModule = new stdclass();
$lang->appModule->sys = array();
$lang->appModule->sys[] = 'tree';
$lang->appModule->sys[] = 'setting';

$lang->appModule->superadmin = array();
$lang->appModule->superadmin[] = 'adminUser';

/* Tree. */
$lang->resource->tree = new stdclass();
$lang->resource->tree->browse   = 'browse';
$lang->resource->tree->edit     = 'edit';
$lang->resource->tree->children = 'children';
$lang->resource->tree->delete   = 'delete';

$lang->tree->methodOrder[0]  = 'browse';
$lang->tree->methodOrder[5]  = 'edit';
$lang->tree->methodOrder[10] = 'children';
$lang->tree->methodOrder[15] = 'delete';

/* Setting. */
$lang->resource->setting = new stdclass();
$lang->resource->setting->lang = 'lang';

$lang->setting->methodOrder[5] = 'lang';

/* User. */
$lang->resource->adminUser = new stdclass();
$lang->resource->adminUser->admin  = 'admin';
$lang->resource->adminUser->create = 'create';
$lang->resource->adminUser->edit   = 'edit';
$lang->resource->adminUser->delete = 'delete';
$lang->resource->adminUser->forbid = 'forbid';
$lang->resource->adminUser->active = 'active';

$lang->adminUser->methodOrder[10] = 'admin';
$lang->adminUser->methodOrder[15] = 'create';
$lang->adminUser->methodOrder[20] = 'edit';
$lang->adminUser->methodOrder[25] = 'delete';
$lang->adminUser->methodOrder[30] = 'forbid';
$lang->adminUser->methodOrder[35] = 'active';
