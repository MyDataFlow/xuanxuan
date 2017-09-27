<?php
$config->xuanxuan = new stdclass();
$config->xuanxuan->version = '1.1.1';
$config->xuanxuan->key     = '88888888888888888888888888888888'; //Set a 32 byte string as your key.

define('TABLE_IM_CHAT',        '`' . $config->db->prefix . 'im_chat`');
define('TABLE_IM_MESSAGE',     '`' . $config->db->prefix . 'im_message`');
define('TABLE_IM_CHATUSER',    '`' . $config->db->prefix . 'im_chatuser`');
define('TABLE_IM_USERMESSAGE', '`' . $config->db->prefix . 'im_usermessage`');
