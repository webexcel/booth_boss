ALTER TABLE `election`.`blocks` 
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `name`;

ALTER TABLE `election`.`booths` 
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `location_point`;

ALTER TABLE `election`.`constituencies` 
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `metadata`;

ALTER TABLE `election`.`parts` 
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `name`;

ALTER TABLE `election`.`roles` 
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `description`;

ALTER TABLE `election`.`permissions` 
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `description`;

ALTER TABLE `election`.`role_permissions` 
DROP FOREIGN KEY `role_permissions_ibfk_1`,
DROP FOREIGN KEY `role_permissions_ibfk_2`;
ALTER TABLE `election`.`role_permissions` 
ADD COLUMN `id` INT NOT NULL AUTO_INCREMENT FIRST,
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `permission_id`,
CHANGE COLUMN `role_id` `role_id` INT NOT NULL ,
CHANGE COLUMN `permission_id` `permission_id` INT NOT NULL ,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`id`);
;
ALTER TABLE `election`.`role_permissions` 
ADD CONSTRAINT `role_permissions_ibfk_1`
  FOREIGN KEY (`role_id`)
  REFERENCES `election`.`roles` (`id`)
  ON DELETE CASCADE,
ADD CONSTRAINT `role_permissions_ibfk_2`
  FOREIGN KEY (`permission_id`)
  REFERENCES `election`.`permissions` (`id`)
  ON DELETE CASCADE;

ALTER TABLE `election`.`user_roles` 
DROP FOREIGN KEY `user_roles_ibfk_1`,
DROP FOREIGN KEY `user_roles_ibfk_2`;
ALTER TABLE `election`.`user_roles` 
ADD COLUMN `id` INT NOT NULL AUTO_INCREMENT FIRST,
ADD COLUMN `status` ENUM('0', '1') NULL DEFAULT '0' AFTER `role_id`,
CHANGE COLUMN `user_id` `user_id` BIGINT NOT NULL ,
CHANGE COLUMN `role_id` `role_id` INT NOT NULL ,
CHANGE COLUMN `assigned_by` `assigned_by` BIGINT NULL DEFAULT NULL ,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`id`);
;
ALTER TABLE `election`.`user_roles` 
ADD CONSTRAINT `user_roles_ibfk_1`
  FOREIGN KEY (`user_id`)
  REFERENCES `election`.`users` (`id`)
  ON DELETE CASCADE,
ADD CONSTRAINT `user_roles_ibfk_2`
  FOREIGN KEY (`role_id`)
  REFERENCES `election`.`roles` (`id`)
  ON DELETE CASCADE;

ALTER TABLE `election`.`tasks` 
CHANGE COLUMN `status` `status` ENUM('open', 'assigned', 'in_progress', 'completed', 'cancelled', 'deleted') CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' NULL DEFAULT 'open' ;

ALTER TABLE `election`.`task_assignments` 
CHANGE COLUMN `status` `status` ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'deleted') CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci' NULL DEFAULT 'pending' ,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`id`, `assignee_id`);

ALTER TABLE `election`.`survey_templates` 
CHANGE COLUMN `template_schema` `template_schema` JSON NULL ;

ALTER TABLE `election`.`voters` 
ADD COLUMN `photo` TEXT NULL DEFAULT NULL AFTER `father_husband_name`;