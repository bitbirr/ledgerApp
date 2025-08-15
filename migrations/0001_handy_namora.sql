CREATE TABLE `app_settings` (
	`setting_id` int AUTO_INCREMENT NOT NULL,
	`setting_key` varchar(100) NOT NULL,
	`setting_value` text,
	`setting_type` varchar(20) DEFAULT 'string',
	`category` varchar(50) NOT NULL,
	`description` text,
	`is_system` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(100),
	`updated_by` varchar(100),
	CONSTRAINT `app_settings_setting_id` PRIMARY KEY(`setting_id`),
	CONSTRAINT `app_settings_setting_key_unique` UNIQUE(`setting_key`)
);
