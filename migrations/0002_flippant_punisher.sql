CREATE TABLE `shops` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`is_default` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `shops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `preferences` MODIFY COLUMN `currency` varchar(10) DEFAULT 'ETB';--> statement-breakpoint
ALTER TABLE `accounts` ADD `shop_id` varchar(255);