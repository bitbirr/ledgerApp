USE ledger;

-- Create shops table
CREATE TABLE IF NOT EXISTS `shops` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_default` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50),
  `type` varchar(50) NOT NULL,
  `category_id` varchar(255),
  `shop_id` varchar(255),
  `photo_url` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `archived` boolean DEFAULT false,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(7) NOT NULL,
  PRIMARY KEY (`id`)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` varchar(255) NOT NULL,
  `account_id` varchar(255) NOT NULL,
  `date_time` timestamp NOT NULL,
  `kind` varchar(10) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `note` text,
  `image_url` text,
  `due_date` timestamp,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` boolean DEFAULT false,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

-- Create cashbook table
CREATE TABLE IF NOT EXISTS `cashbook` (
  `id` varchar(255) NOT NULL,
  `date_time` timestamp NOT NULL,
  `direction` varchar(10) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `note` text,
  `attachment_url` text,
  PRIMARY KEY (`id`)
);

-- Create preferences table
CREATE TABLE IF NOT EXISTS `preferences` (
  `id` int AUTO_INCREMENT NOT NULL,
  `date_format` varchar(20) DEFAULT 'DD/MM/YYYY',
  `time_format` varchar(5) DEFAULT '12',
  `currency` varchar(10) DEFAULT 'ETB',
  `language` varchar(10) DEFAULT 'en',
  `first_day_of_week` int DEFAULT 1,
  `first_day_of_month` int DEFAULT 1,
  `first_day_of_year` int DEFAULT 1,
  `show_time_in_reports` boolean DEFAULT true,
  `show_previous_balance` boolean DEFAULT true,
  `dark_mode` boolean DEFAULT false,
  `biometric_enabled` boolean DEFAULT false,
  PRIMARY KEY (`id`)
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS `app_settings` (
  `setting_id` int AUTO_INCREMENT NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_type` varchar(20) DEFAULT 'string',
  `category` varchar(50) NOT NULL,
  `description` text,
  `is_system` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(100),
  `updated_by` varchar(100),
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `app_settings_setting_key_unique` (`setting_key`)
);

-- Create items table
CREATE TABLE IF NOT EXISTS `items` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `uom` varchar(50) NOT NULL,
  `category_id` varchar(255),
  `opening_stock` decimal(10,2) DEFAULT '0',
  `low_stock_alert` decimal(10,2) DEFAULT '0',
  PRIMARY KEY (`id`)
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS `invoices` (
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
  PRIMARY KEY (`id`)
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` varchar(255) NOT NULL,
  `invoice_id` varchar(255) NOT NULL,
  `item_id` varchar(255) NOT NULL,
  `qty` decimal(10,2) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `discount_pct` decimal(5,2) DEFAULT '0',
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
);