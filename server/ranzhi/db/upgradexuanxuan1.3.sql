ALTER TABLE `im_message` ADD `order` mediumint(8) unsigned NOT NULL AFTER `date`;
ALTER TABLE `im_message` ADD `data` text NOT NULL DEFAULT '' AFTER `contentType`;
ALTER TABLE `im_chatuser` ADD `category` varchar(40) NOT NULL DEFAULT '' AFTER `quit`;
