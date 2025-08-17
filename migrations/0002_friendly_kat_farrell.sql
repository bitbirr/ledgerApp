CREATE TABLE `audit_logs` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`business_id` varchar(255),
	`branch_id` varchar(255),
	`action` varchar(100) NOT NULL,
	`table_name` varchar(100),
	`record_id` varchar(255),
	`old_values` text,
	`new_values` text,
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `branches` (
	`id` varchar(255) NOT NULL,
	`business_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`phone` varchar(50),
	`email` varchar(255),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `branches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `business_users` MODIFY COLUMN `role` varchar(50) DEFAULT 'Staff';--> statement-breakpoint
ALTER TABLE `business_users` ADD `branch_id` varchar(255);--> statement-breakpoint
CREATE INDEX `ix_audit_logs_user` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `ix_audit_logs_business` ON `audit_logs` (`business_id`);--> statement-breakpoint
CREATE INDEX `ix_audit_logs_branch` ON `audit_logs` (`branch_id`);--> statement-breakpoint
CREATE INDEX `ix_audit_logs_action` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `ix_audit_logs_table` ON `audit_logs` (`table_name`);--> statement-breakpoint
CREATE INDEX `ix_audit_logs_date` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `ix_branches_business` ON `branches` (`business_id`);--> statement-breakpoint
CREATE INDEX `ix_business_users_business` ON `business_users` (`business_id`);--> statement-breakpoint
CREATE INDEX `ix_business_users_branch` ON `business_users` (`branch_id`);