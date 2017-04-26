ALTER TABLE `sys_file` CHANGE `pathname` `pathname` char(100) NOT NULL;

INSERT INTO `sys_config` (`owner`, `app`, `module`, `section`, `key`, `value`) VALUES ('system', 'sys', 'xuanxuan', 'global', 'version', '1.1.0');

TRUNCATE `im_usermessage`;

ALTER TABLE `im_usermessage` DROP `module`;
ALTER TABLE `im_usermessage` DROP `method`;
ALTER TABLE `im_usermessage` CHANGE `data` `message` text not null;

DROP TABLE `im_chatfile`;
