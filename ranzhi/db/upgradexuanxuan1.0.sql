ALTER TABLE `sys_file` CHANGE `pathname` `pathname` char(100) NOT NULL;

TRUNCATE `im_usermessage`;

ALTER TABLE `im_usermessage` DROP `module`;
ALTER TABLE `im_usermessage` DROP `method`;
ALTER TABLE `im_usermessage` CHANGE `data` `message` text not null;

DROP TABLE IF EXISTS `im_chatfile`;
