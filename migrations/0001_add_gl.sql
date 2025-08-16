-- Migration 0001_add_gl.sql: General Ledger, Inventory Movements, Tax, Posting Rules, Opening Balances

-- GL Accounts
CREATE TABLE IF NOT EXISTS `gl_accounts` (
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
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_gl_accounts_business_code` (`business_id`,`code`),
  KEY `ix_gl_accounts_business_parent` (`business_id`,`parent_id`)
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS `gl_journal_entries` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `entry_date` timestamp NOT NULL,
  `memo` text,
  `source_module` varchar(50) NOT NULL,
  `source_id` varchar(255),
  `posted_by` varchar(255) NOT NULL,
  `posted_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `locked` boolean DEFAULT false,
  PRIMARY KEY (`id`),
  KEY `ix_gl_journal_entries_business_date` (`business_id`,`entry_date`)
);

-- Journal Lines
CREATE TABLE IF NOT EXISTS `gl_journal_lines` (
  `id` varchar(255) NOT NULL,
  `entry_id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `account_id` varchar(255) NOT NULL,
  `debit` decimal(14,2) DEFAULT '0',
  `credit` decimal(14,2) DEFAULT '0',
  `party_id` varchar(255),
  `item_id` varchar(255),
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `ix_gl_journal_lines_entry` (`entry_id`),
  KEY `ix_gl_journal_lines_account` (`account_id`),
  KEY `ix_gl_journal_lines_business` (`business_id`),
  KEY `ix_gl_journal_lines_party` (`party_id`),
  KEY `ix_gl_journal_lines_item` (`item_id`)
);

-- Inventory Movements
CREATE TABLE IF NOT EXISTS `inventory_movements` (
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
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_inventory_movements_business_date_item` (`business_id`,`date`,`item_id`)
);

-- Tax Rates
CREATE TABLE IF NOT EXISTS `tax_rates` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `rate` decimal(6,4) NOT NULL,
  `effective_from` timestamp NOT NULL,
  `effective_to` timestamp,
  `is_active` boolean DEFAULT true,
  `kind` varchar(10) DEFAULT 'VAT',
  PRIMARY KEY (`id`),
  KEY `ix_tax_rates_business_active` (`business_id`,`is_active`)
);

-- Tax Codes
CREATE TABLE IF NOT EXISTS `tax_codes` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100),
  `rate_id` varchar(255) NOT NULL,
  `scope` varchar(20) NOT NULL,
  `direction` varchar(10) NOT NULL,
  `is_default` boolean DEFAULT false,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_tax_codes_business_code` (`business_id`,`code`),
  KEY `ix_tax_codes_business` (`business_id`)
);

-- Posting Rules
CREATE TABLE IF NOT EXISTS `posting_rules` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `debit_account_id` varchar(255),
  `credit_account_id` varchar(255),
  `formula` text,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_posting_rules_business_module_action` (`business_id`,`module`,`action`)
);

-- Opening Balances
CREATE TABLE IF NOT EXISTS `opening_balances` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `period_start` timestamp NOT NULL,
  `memo` text,
  `locked` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_opening_balances_business_period` (`business_id`,`period_start`)
);