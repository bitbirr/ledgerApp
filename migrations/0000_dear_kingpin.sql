CREATE TABLE `accounts` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(50),
	`type` varchar(50) NOT NULL,
	`category_id` varchar(255),
	`photo_url` text,
	`created_at` timestamp DEFAULT (now()),
	`archived` boolean DEFAULT false,
	`user_id` varchar(255) NOT NULL,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashbook` (
	`id` varchar(255) NOT NULL,
	`date_time` timestamp NOT NULL,
	`direction` varchar(10) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`note` text,
	`attachment_url` text,
	CONSTRAINT `cashbook_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`color` varchar(7) NOT NULL,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` varchar(255) NOT NULL,
	`invoice_id` varchar(255) NOT NULL,
	`item_id` varchar(255) NOT NULL,
	`qty` decimal(10,2) NOT NULL,
	`rate` decimal(10,2) NOT NULL,
	`discount_pct` decimal(5,2) DEFAULT '0',
	`total` decimal(10,2) NOT NULL,
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` varchar(255) NOT NULL,
	`number` varchar(100) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`kind` varchar(20) NOT NULL,
	`issue_date` timestamp NOT NULL,
	`due_date` timestamp,
	`subtotal` decimal(10,2) NOT NULL,
	`discount` decimal(10,2) DEFAULT '0',
	`addl_charges` decimal(10,2) DEFAULT '0',
	`total` decimal(10,2) NOT NULL,
	`pdf_url` text,
	`status` varchar(20) NOT NULL,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`rate` decimal(10,2) NOT NULL,
	`uom` varchar(50) NOT NULL,
	`category_id` varchar(255),
	`opening_stock` decimal(10,2) DEFAULT '0',
	`low_stock_alert` decimal(10,2) DEFAULT '0',
	CONSTRAINT `items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date_format` varchar(20) DEFAULT 'DD/MM/YYYY',
	`time_format` varchar(5) DEFAULT '12',
	`currency` varchar(10) DEFAULT 'INR',
	`language` varchar(10) DEFAULT 'en',
	`first_day_of_week` int DEFAULT 1,
	`first_day_of_month` int DEFAULT 1,
	`first_day_of_year` int DEFAULT 1,
	`show_time_in_reports` boolean DEFAULT true,
	`show_previous_balance` boolean DEFAULT true,
	`dark_mode` boolean DEFAULT false,
	`biometric_enabled` boolean DEFAULT false,
	CONSTRAINT `preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(255) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`date_time` timestamp NOT NULL,
	`kind` varchar(10) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`note` text,
	`image_url` text,
	`due_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	`deleted` boolean DEFAULT false,
	`user_id` varchar(255) NOT NULL,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
