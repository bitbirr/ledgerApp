CREATE TABLE `business_users` (
	`id` varchar(255) NOT NULL,
	`business_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`role` varchar(50) DEFAULT 'staff',
	`permissions` text,
	`invited_by` varchar(255),
	`invited_at` timestamp DEFAULT (now()),
	`accepted_at` timestamp,
	`status` varchar(20) DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `business_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`phone` varchar(50),
	`email` varchar(255),
	`website` varchar(255),
	`logo_url` text,
	`owner_id` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gl_accounts` (
	`id` varchar(255) NOT NULL,
	`business_id` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(20) NOT NULL,
	`parent_id` varchar(255),
	`is_leaf` boolean DEFAULT true,
	`is_active` boolean DEFAULT true,
	`system_flag` boolean DEFAULT false,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gl_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gl_journal_entries` (
	`id` varchar(255) NOT NULL,
	`business_id` varchar(255) NOT NULL,
	`entry_date` timestamp NOT NULL,
	`memo` text,
	`source_module` varchar(50) NOT NULL,
	`source_id` varchar(255),
	`posted_by` varchar(255) NOT NULL,
	`posted_at` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`locked` boolean DEFAULT false,
	CONSTRAINT `gl_journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gl_journal_lines` (
	`id` varchar(255) NOT NULL,
	`entry_id` varchar(255) NOT NULL,
	`business_id` varchar(255) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`debit` decimal(14,2) DEFAULT '0',
	`credit` decimal(14,2) DEFAULT '0',
	`party_id` varchar(255),
	`item_id` varchar(255),
	`notes` text,
	CONSTRAINT `gl_journal_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` varchar(255) NOT NULL,
	`business_id` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`item_id` varchar(255) NOT NULL,
	`qty_in` decimal(14,3) DEFAULT '0',
	`qty_out` decimal(14,3) DEFAULT '0',
	`unit_cost` decimal(14,4) NOT NULL,
	`value` decimal(16,2) NOT NULL,
	`source_module` varchar(50) NOT NULL,
	`source_id` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `inventory_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opening_balances` (
	`id` varchar(255) NOT NULL,
	`business_id` varchar(255) NOT NULL,
	`period_start` timestamp NOT NULL,
	`memo` text,
	`locked` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `opening_balances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posting_rules` (
	`id` varchar(255) NOT NULL,
	`business_id` varchar(255) NOT NULL,
	`module` varchar(50) NOT NULL,
	`action` varchar(50) NOT NULL,
	`debit_account_id` varchar(255),
	`credit_account_id` varchar(255),
	`formula` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posting_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_codes` (
	`id` varchar(255) NOT NULL,
	`business_id` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100),
	`rate_id` varchar(255) NOT NULL,
	`scope` varchar(20) NOT NULL,
	`direction` varchar(10) NOT NULL,
	`is_default` boolean DEFAULT false,
	CONSTRAINT `tax_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_rates` (
	`id` varchar(255) NOT NULL,
	`business_id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`rate` decimal(6,4) NOT NULL,
	`effective_from` timestamp NOT NULL,
	`effective_to` timestamp,
	`is_active` boolean DEFAULT true,
	`kind` varchar(10) DEFAULT 'VAT',
	CONSTRAINT `tax_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`email_verified` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
DROP TABLE `shops`;--> statement-breakpoint
ALTER TABLE `accounts` ADD `business_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `cashbook` ADD `business_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `business_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `business_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `business_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `preferences` ADD `business_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `business_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` DROP COLUMN `shop_id`;