ALTER TABLE `sys_user` ADD `token` char(32)  NULL DEFAULT '' AFTER `locked`;
ALTER TABLE `sys_user` ADD INDEX `token` (`token`);
