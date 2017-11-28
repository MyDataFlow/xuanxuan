-- DROP TABLE IF EXISTS `im_chat`;
CREATE TABLE IF NOT EXISTS `im_chat` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `gid` char(40) NOT NULL DEFAULT '',
  `name` varchar(60) NOT NULL DEFAULT '',
  `type` varchar(20) NOT NULL DEFAULT 'group',
  `admins` varchar(255) NOT NULL DEFAULT '',
  `committers` varchar(255) NOT NULL DEFAULT '',
  `subject` mediumint(8) unsigned NOT NULL DEFAULT 0,
  `public` enum('0', '1') NOT NULL DEFAULT '0',
  `createdBy` varchar(30) NOT NULL DEFAULT '',
  `createdDate` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `editedBy` varchar(30) NOT NULL DEFAULT '',
  `editedDate` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `lastActiveTime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `dismissDate` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `gid` (`gid`),
  KEY `name` (`name`),
  KEY `type` (`type`),
  KEY `public` (`public`),
  KEY `createdBy` (`createdBy`),
  KEY `editedBy` (`editedBy`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- DROP TABLE IF EXISTS `im_message`;
CREATE TABLE IF NOT EXISTS `im_message` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `gid` char(40) NOT NULL DEFAULT '',
  `cgid` char(40) NOT NULL DEFAULT '',
  `user` varchar(30) NOT NULL DEFAULT '',
  `date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `order` mediumint(8) unsigned NOT NULL,
  `type` enum('normal', 'broadcast') NOT NULL DEFAULT 'normal',
  `content` text NOT NULL DEFAULT '',
  `contentType` enum('text', 'emotion', 'image', 'file', 'object') NOT NULL DEFAULT 'text',
  `data` text NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `mgid` (`gid`),
  KEY `mcgid` (`cgid`),
  KEY `muser` (`user`),
  KEY `mtype` (`type`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- DROP TABLE IF EXISTS `im_chatuser`;
CREATE TABLE IF NOT EXISTS `im_chatuser`(
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `cgid` char(40) NOT NULL DEFAULT '',
  `user` mediumint(8) NOT NULL DEFAULT 0,
  `order` smallint(5) NOT NULL DEFAULT 0,
  `star` enum('0', '1') NOT NULL DEFAULT '0',
  `hide` enum('0', '1') NOT NULL DEFAULT '0',
  `mute` enum('0', '1') NOT NULL DEFAULT '0',
  `join` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `quit` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `category` varchar(40) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `cgid` (`cgid`),
  KEY `user` (`user`),
  KEY `order` (`order`),
  KEY `star` (`star`),
  KEY `hide` (`hide`),
  UNIQUE KEY `chatuser` (`cgid`, `user`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- DROP TABLE IF EXISTS `im_usermessage`;
CREATE TABLE IF NOT EXISTS `im_usermessage`(
  `id` mediumint(8) NOT NULL AUTO_INCREMENT,
  `level` smallint(5) NOT NULL DEFAULT 3,
  `user` mediumint(8) NOT NULL DEFAULT 0,
  `message` text NOT NULL DEFAULT '',
  PRIMARY KEY `id` (`id`),
  KEY `muser` (`user`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

ALTER TABLE `sys_user` ADD `status` enum('online', 'away', 'busy', 'offline') NOT NULL DEFAULT 'offline';
ALTER TABLE `sys_file` CHANGE `pathname` `pathname` char(100) NOT NULL;
