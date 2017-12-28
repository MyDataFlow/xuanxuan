<?php
$config->xuanxuan = new stdclass();
$config->xuanxuan->version = '1.3.0';
$config->xuanxuan->key     = '88888888888888888888888888888888'; //Set a 32 byte string as your key.

if(!defined('TABLE_IM_CHAT'))        define('TABLE_IM_CHAT',        '`' . $config->db->prefix . 'im_chat`');
if(!defined('TABLE_IM_MESSAGE'))     define('TABLE_IM_MESSAGE',     '`' . $config->db->prefix . 'im_message`');
if(!defined('TABLE_IM_CHATUSER'))    define('TABLE_IM_CHATUSER',    '`' . $config->db->prefix . 'im_chatuser`');
if(!defined('TABLE_IM_USERMESSAGE')) define('TABLE_IM_USERMESSAGE', '`' . $config->db->prefix . 'im_usermessage`');
