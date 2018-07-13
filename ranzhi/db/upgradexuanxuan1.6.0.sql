ALTER TABLE `sys_user` ADD `token` char(32)  NULL DEFAULT '' AFTER `locked`;
ALTER TABLE `sys_user` ADD INDEX `token` (`token`);
ALTER TABLE `im_message` CHANGE `contentType` `contentType` ENUM('text', 'plain', 'emotion', 'image', 'file', 'object')  CHARACTER SET utf8  COLLATE utf8_general_ci  NOT NULL  DEFAULT 'text';
