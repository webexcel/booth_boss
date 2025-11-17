ALTER TABLE `election`.`blocks` 
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `name`;

ALTER TABLE `election`.`booths` 
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `location_point`;

ALTER TABLE `election`.`constituencies` 
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `metadata`;

ALTER TABLE `election`.`parts` 
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `name`;