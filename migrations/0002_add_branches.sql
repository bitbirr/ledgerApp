-- Migration 0002_add_branches.sql: Add branches table and update business_users table
use ledger_plus;
-- Create branches table
CREATE TABLE IF NOT EXISTS `branches` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text,
  `phone` varchar(50),
  `email` varchar(255),
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_branches_business` (`business_id`),
  CONSTRAINT `fk_branches_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
);

-- Add branch_id column to business_users table
ALTER TABLE `business_users` ADD `branch_id` varchar(255);
ALTER TABLE `business_users` ADD KEY `ix_business_users_branch` (`branch_id`);
ALTER TABLE `business_users` ADD CONSTRAINT `fk_business_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;

-- Update role values to match RBAC design
UPDATE `business_users` SET `role` = 'Staff' WHERE `role` = 'staff';
UPDATE `business_users` SET `role` = 'Admin' WHERE `role` = 'admin';