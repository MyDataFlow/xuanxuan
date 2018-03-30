<?php
$config->xuanxuan = new stdclass();
$config->xuanxuan->version = '1.4.0';
$config->xuanxuan->key     = '88888888888888888888888888888888'; //Set a 32 byte string as your key.

if(!defined('TABLE_IM_CHAT'))        define('TABLE_IM_CHAT',        '`' . $config->db->prefix . 'im_chat`');
if(!defined('TABLE_IM_MESSAGE'))     define('TABLE_IM_MESSAGE',     '`' . $config->db->prefix . 'im_message`');
if(!defined('TABLE_IM_CHATUSER'))    define('TABLE_IM_CHATUSER',    '`' . $config->db->prefix . 'im_chatuser`');
if(!defined('TABLE_IM_USERMESSAGE')) define('TABLE_IM_USERMESSAGE', '`' . $config->db->prefix . 'im_usermessage`');

$config->xuanxuan->enabledMethods['chat']['serverstart']        = 'serverStart';
$config->xuanxuan->enabledMethods['chat']['login']              = 'login';
$config->xuanxuan->enabledMethods['chat']['logout']             = 'logout';
$config->xuanxuan->enabledMethods['chat']['usergetlist']        = 'userGetList';
$config->xuanxuan->enabledMethods['chat']['userchange']         = 'userChange';
$config->xuanxuan->enabledMethods['chat']['ping']               = 'ping';
$config->xuanxuan->enabledMethods['chat']['getpubliclist']      = 'getPublicList';
$config->xuanxuan->enabledMethods['chat']['getlist']            = 'getList';
$config->xuanxuan->enabledMethods['chat']['members']            = 'members';
$config->xuanxuan->enabledMethods['chat']['getofflinemessages'] = 'getOfflineMessages';
$config->xuanxuan->enabledMethods['chat']['create']             = 'create';
$config->xuanxuan->enabledMethods['chat']['setadmin']           = 'setAdmin';
$config->xuanxuan->enabledMethods['chat']['joinchat']           = 'joinChat';
$config->xuanxuan->enabledMethods['chat']['changename']         = 'changeName';
$config->xuanxuan->enabledMethods['chat']['dismiss']            = 'dismiss';
$config->xuanxuan->enabledMethods['chat']['setcommitters']      = 'setCommitters';
$config->xuanxuan->enabledMethods['chat']['changepublic']       = 'changePublic';
$config->xuanxuan->enabledMethods['chat']['star']               = 'star';
$config->xuanxuan->enabledMethods['chat']['hide']               = 'hide';
$config->xuanxuan->enabledMethods['chat']['category']           = 'category';
$config->xuanxuan->enabledMethods['chat']['addmember']          = 'addMember';
$config->xuanxuan->enabledMethods['chat']['message']            = 'message';
$config->xuanxuan->enabledMethods['chat']['history']            = 'history';
$config->xuanxuan->enabledMethods['chat']['settings']           = 'settings';
$config->xuanxuan->enabledMethods['chat']['uploadfile']         = 'uploadFile';
<<<<<<< HEAD
$config->xuanxuan->enabledMethods['chat']['getofflinenotify']   = 'getofflinenotify';
$config->xuanxuan->enabledMethods['chat']['notify']             = 'notify';
=======
$config->xuanxuan->enabledMethods['chat']['upserttodo']         = 'upsertTodo';
$config->xuanxuan->enabledMethods['chat']['gettodoes']          = 'getTodoes';
>>>>>>> de0c42a3bd12929d78725209b8e1510fb04165f1
