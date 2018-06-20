ALTER TABLE `sys_entry` ADD `status` ENUM('online','offline')  NOT NULL  DEFAULT 'online'  AFTER `category`;
ALTER TABLE `sys_entry` ADD `version` VARCHAR(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL AFTER `buildin`;
ALTER TABLE `sys_entry` ADD `platform` VARCHAR(255) NOT NULL DEFAULT 'ranzhi' AFTER `version`;
ALTER TABLE `sys_entry` ADD `package` INT(11)  NOT NULL DEFAULT '0'  AFTER `platform`;
